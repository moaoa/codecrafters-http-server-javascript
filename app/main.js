const net = require("net");
const fs = require("fs");
const pathUtil = require("path");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  socket.on("close", () => {
    // socket.end();
    // server.close();
  });
  socket.on("data", (data) => {
    const requestLine = data.toString().split("\r\n")[0];
    const [requestMethod, path, httpVersion] = requestLine.split(" ");

    const requestParts = data.toString().split("\r\n");

    const headers = {};

    let i = 1;

    while (requestParts[i] !== "") {
      const keyValuePairs = requestParts[i].split(":");
      const key = keyValuePairs[0].trim();
      const value = keyValuePairs[1].trim();
      headers[key] = value;
      i++;
    }

    let body = "";

    while (i < requestParts.length) {
      body += requestParts[i];
      i++;
    }

    console.log("headers: ", headers);
    console.log("method: ", requestMethod);
    console.log("body: ", body);

    if (path === "/") {
      socket.write("HTTP/1.1  200 OK\r\n\r\n", console.error);
    } else if (path.startsWith("/echo")) {
      const data = path.slice("/echo/".length);

      socket.write("HTTP/1.1  200 OK\r\n");
      socket.write("Content-Type: text/plain\r\n");
      socket.write(`Content-Length: ${data.length}\r\n\r\n`);
      socket.write(data);
    } else if (path.startsWith("/user-agent")) {
      const userAgent = headers["User-Agent"];
      socket.write("HTTP/1.1  200 OK\r\n");
      socket.write("Content-Type: text/plain\r\n");
      socket.write(`Content-Length: ${userAgent.length}\r\n\r\n`);
      socket.write(userAgent);
      console.log(userAgent);
    } else if (path.startsWith("/files") && requestMethod === "GET") {
      const fileName = path.replace("/files/", "");

      console.log(process.argv);
      const directory = process.argv[3] ?? __dirname;

      const filePath = pathUtil.join(directory, fileName);

      if (!fs.existsSync(filePath)) {
        console.log(404);
        socket.write("HTTP/1.1  404 Not Found\r\n\r\n", console.error);
      } else {
        const data = fs.readFileSync(filePath, "utf8");
        console.log("content: ", data);

        socket.write("HTTP/1.1  200 OK\r\n");
        socket.write("Content-Type: application/octet-stream\r\n");
        socket.write(`Content-Length: ${data.length}\r\n\r\n`);
        socket.write(data);
      }
    } else if (path.startsWith("/files") && requestMethod === "POST") {
      const fileName = path.replace("/files/", "");

      console.log(process.argv);
      const directory = process.argv[3] ?? __dirname;

      const filePath = pathUtil.join(directory, fileName);

      console.log("content: ", body);
      fs.writeFileSync(filePath, body);

      socket.write("HTTP/1.1  201 OK\r\n");
      socket.write("Content-Type: application/octet-stream\r\n");
      socket.write(`Content-Length: ${body.length}\r\n\r\n`);
    } else {
      socket.write("HTTP/1.1  404 Not Found\r\n\r\n", console.error);
    }
    socket.end();
  });

  socket.on("error", (err) => {
    console.log(err);
  });
});

server.listen(4221, "localhost");
