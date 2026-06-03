import cloudflared from "cloudflared";

const tunnel = await cloudflared.tunnel({ url: "http://localhost:3001" });
console.log("隧道地址:", tunnel.url);
