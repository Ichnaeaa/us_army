import { JSDOM } from "jsdom";
import * as d3 from "d3";
import fs from "fs";
import nodeHtmlToImage from "node-html-to-image";
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env

const { Client } = pkg;

const client = new Client({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
});

function buildTree(data) {
  const map = {};
  let root = null;

  data.forEach((r) => {
    map[r.r_id] = { ...r, children: [] };
  });

  data.forEach((r) => {
    if (r.r_parent === null) {
      root = map[r.r_id];
    } else if (map[r.r_parent]) {
      map[r.r_parent].children.push(map[r.r_id]);
    }
  });

  return root;
}

async function run() {
  try {
    await client.connect();
    console.log(
      `Connected to PostgreSQL at ${process.env.DB_HOST}:${process.env.DB_PORT}`
    );

    const res = await client.query(
      "SELECT r_id, r_name, r_parent FROM public.rolle ORDER BY r_id;"
    );
    const data = res.rows;
    if (!data.length) throw new Error("no data found");

    const root = buildTree(data);

    const { window } = new JSDOM("<!DOCTYPE html><body></body>");
    const body = d3.select(window.document).select("body");

    const width = 4800;
    const dx = 110;
    const dy = 160;
    const tree = d3.tree().nodeSize([dy, dx]);

    const hierarchy = d3.hierarchy(root);
    const rootLayout = tree(hierarchy);

    let x0 = Infinity;
    let x1 = -Infinity;

    rootLayout.each((d) => {
      if (d.x > x1) x1 = d.x;
      if (d.x < x0) x0 = d.x;
    });

    const depth = d3.max(rootLayout.descendants(), (d) => d.y) || 0;
    const height = depth + dx * 4;

    const svg = body
      .append("svg")
      .attr("xmlns", "http://www.w3.org/2000/svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("font-family", "'Open Sans', system-ui, sans-serif")
      .style("font-size", "13px")
      .style("background", "#F1F8E9");

    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2},${dx})`);

    // Lines
    g.append("g")
      .attr("fill", "none")
      .attr("stroke", "#66BB6A")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "6,4")
      .selectAll("path")
      .data(rootLayout.links())
      .join("path")
      .attr(
        "d",
        d3
          .linkVertical()
          .x((d) => d.x)
          .y((d) => d.y)
      );

    const node = g
      .append("g")
      .selectAll("g")
      .data(rootLayout.descendants())
      .join("g")
      .attr("transform", (d) => `translate(${d.x},${d.y})`);

    const rectWidth = 160;
    const rectHeight = 50;

    node
      .append("rect")
      .attr("x", -rectWidth / 2)
      .attr("y", -rectHeight / 2)
      .attr("width", rectWidth)
      .attr("height", rectHeight)
      .attr("fill", "#2E7D32")
      .attr("stroke", "#1B5E20")
      .attr("stroke-width", 2)
      .attr("opacity", 0.96);

    node
      .append("rect")
      .attr("x", -rectWidth / 2 + 3)
      .attr("y", -rectHeight / 2 + 3)
      .attr("width", rectWidth - 6)
      .attr("height", rectHeight - 6)
      .attr("fill", "none")
      .attr("stroke", "#A5D6A7")
      .attr("stroke-width", 1);

    node
      .append("text")
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .attr("fill", "#E8F5E9")
      .style("font-weight", "600")
      .text((d) => d.data.r_name);

    const svgString = body.select("svg").node().outerHTML;
    fs.writeFileSync("./tree_diagram.svg", svgString);
    console.log("generated svg");

    await nodeHtmlToImage({
      output: "./tree_diagram.png",
      html: `
<html>
  <body style="margin:0; padding:0; background:#F1F8E9;">
    <div style="width:${width}px; height:${height}px;">
      ${svgString}
    </div>
  </body>
</html>`,
      puppeteerArgs: {
        defaultViewport: {
          width,
          height,
        },
      },
      fullPage: true,
    });

    console.log("generated png");
  } catch (err) {
    console.error("error:", err);
  } finally {
    await client.end();
    console.log("connection closed");
  }
}

run();
