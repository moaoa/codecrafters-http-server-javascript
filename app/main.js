const net = require("net");

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
      const key = keyValuePairs[0];
      const value = keyValuePairs[1];
      headers[key] = value;
      i++;
    }

    if (path === "/") {
      socket.write("HTTP/1.1  200 OK\r\n\r\n", console.error);
    } else if (path.startsWith("/echo")) {
      const data = path.slice("/echo/".length);

      socket.write("HTTP/1.1  200 OK\r\n");
      socket.write("Content-Type: text/plain\r\n");
      socket.write(`Content-Length: ${data.length}\r\n\r\n`);
      socket.write(data);
    } else if (path.startsWith("/user-agent")) {
      const data = path.replace("/user-agent/", "");

      socket.write("HTTP/1.1  200 OK\r\n");
      socket.write("Content-Type: text/plain\r\n");
      socket.write(`Content-Length: ${data.length}\r\n\r\n`);
      socket.write(data);
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
