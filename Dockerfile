FROM node:19-alpine AS base
WORKDIR /
RUN apk --no-cache add libaio libnsl libc6-compat curl && \
    cd /tmp && \
    curl -o instantclient-basic.zip https://download.oracle.com/otn_software/linux/instantclient/2115000/instantclient-basic-linux.x64-21.15.0.0.0dbru.zip -SL && \
    unzip instantclient-basic.zip && \
    mv instantclient*/ /usr/lib/instantclient && \
    rm instantclient-basic.zip && \
    ln -s /usr/lib/instantclient/libclntsh.so.23.1 /usr/lib/libclntsh.so && \
    ln -s /usr/lib/instantclient/libocci.so.23.1 /usr/lib/libocci.so && \
    ln -s /usr/lib/instantclient/libociicus.so /usr/lib/libociicus.so && \
    ln -s /usr/lib/instantclient/libnnz23.so /usr/lib/libnnz23.so && \
    ln -s /usr/lib/instantclient/libociei.so /usr/lib/libociei.so && \
    ln -s /usr/lib/instantclient/libclntshcore.so.23.1 /usr/lib/libclntshcore.so && \
    ln -s /usr/lib/instantclient/libocijdbc23.so /usr/lib/libocijdbc23.so && \
    ln -s /usr/lib/instantclient/libtfojdbc1.so /usr/lib/libtfojdbc1.so && \
    ln -s /usr/lib/instantclient/pkcs11.so /usr/lib/pkcs11.so && \
    ln -s /usr/lib/libnsl.so.2 /usr/lib/libnsl.so.1 && \
    ln -s /lib/libc.so.6 /usr/lib/libresolv.so.2 && \
    ln -s /lib64/ld-linux-x86-64.so.2 /usr/lib/ld-linux-x86-64.so.2 && \
    ln -s /usr/lib/libaio.so.1 /lib/libaio.so.1

ENV LD_LIBRARY_PATH /usr/lib/instantclient

COPY package.json pnpm-lock.yaml* ./
RUN yarn global add pnpm && pnpm i --no-frozen-lockfile

COPY . .

RUN yarn run build

ENV NODE_ENV production

RUN addgroup --system nodejs
RUN adduser --system --ingroup nodejs nextjs

RUN cd /tmp && \
    curl -o oracledb-6.6.0.tgz https://registry.npmjs.com/oracledb/-/oracledb-6.6.0.tgz && \
    tar -xzvf oracledb-6.6.0.tgz && \
    rm -rf oracledb-6.6.0.tgz && \
    mkdir -p /.next/standalone/node_modules/oracledb/build/Release/ && \
    cp ./package/build/Release/oracledb-6.6.0-linux-x64.node /.next/standalone/node_modules/oracledb/build/Release/oracledb.node

EXPOSE 3000

ENV PORT 3000

CMD ["yarn", "run", "start"]
