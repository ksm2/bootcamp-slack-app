FROM denoland/deno:1.42.1
WORKDIR /usr/src/app
EXPOSE 8080

ENV DB_LOCATION="/usr/var/data"

COPY deno.json deno.lock ./
COPY src ./src

RUN deno cache src/main.ts

CMD ["run", "--allow-read", "--allow-write=/usr/var/data", "--allow-env", "--allow-ffi", "--allow-sys=osRelease", "--allow-net=slack.com,wss-primary.slack.com,0.0.0.0", "src/main.ts"]
