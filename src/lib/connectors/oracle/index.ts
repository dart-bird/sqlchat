import oracledb from "oracledb";
import { Connection, ExecutionResult, Table, Schema } from "@/types";
import { Connector } from "..";
const systemSchemas =
  "'SYS', 'SYSTEM', 'OUTLN', 'XDB', 'DBSNMP', 'GSMADMIN_INTERNAL', 'GSMCATUSER', 'GSMUSER', 'APPQOSSYS', 'OJVMSYS', 'DVF', 'DVSYS', 'LBACSYS', 'REMOTE_SCHEDULER_AGENT', 'AUDSYS', 'WMSYS', 'ORDDATA', 'ORDPLUGINS', 'ORDSYS', 'CTXSYS', 'MDSYS', 'ANONYMOUS', 'EXFSYS', 'XDBPM', 'DBSFWUSER', 'SYSBACKUP', 'SYSDG', 'SYSKM', 'SYSRAC', 'GGSYS', 'OLAPSYS'";

const newOracleClient = async (connection: Connection) => {
  const config = {
    user: connection.username,
    password: connection.password,
    connectString: `${connection.host}:${connection.port}/${connection.database}`,
  };

  try {
    oracledb.initOracleClient();
    oracledb.fetchAsString = [oracledb.CLOB];
  } catch (error) {
    console.error("Error initializing Oracle client:", error);
    throw error;
  }

  const client = await oracledb.getConnection(config);
  return client;
};

const testConnection = async (connection: Connection): Promise<boolean> => {
  const client = await newOracleClient(connection);
  await client.close();
  return true;
};

const execute = async (connection: Connection, databaseName: string, statement: string): Promise<any> => {
  connection.database = databaseName;
  const client = await newOracleClient(connection);
  const result = await client.execute(statement, {}, { outFormat: oracledb.OUT_FORMAT_OBJECT });
  await client.close();

  const executionResult: ExecutionResult = {
    rawResult: result.rows,
    affectedRows: result.rowsAffected,
  };
  // For those SELECT statement, we should set the affectedRows to undefined.
  if (executionResult.rawResult.length === result.rowsAffected) {
    executionResult.affectedRows = undefined;
  }
  return executionResult;
};

const getDatabases = async (connection: Connection): Promise<string[]> => {
  // Oracle does not have multiple databases in a single instance like PostgreSQL, so we return the single database name.
  return [connection.database];
};

const getTableSchema = async (connection: Connection, databaseName: string): Promise<Schema[]> => {
  connection.database = databaseName;
  const client = await newOracleClient(connection);
  const query = `
    SELECT OWNER AS table_schema, TABLE_NAME AS table_name
    FROM ALL_TABLES
    WHERE OWNER NOT IN (${systemSchemas})
  `;
  const { rows } = await client.execute(query, {}, { outFormat: oracledb.OUT_FORMAT_OBJECT });

  const schemaList: Schema[] = [];
  for (const row of rows) {
    if (row["TABLE_NAME"]) {
      const schema = schemaList.find((schema) => schema.name === row["TABLE_SCHEMA"]);
      if (schema) {
        schema.tables.push({ name: row["TABLE_NAME"] as string, structure: "" } as Table);
      } else {
        schemaList.push({
          name: row["TABLE_SCHEMA"],
          tables: [{ name: row["TABLE_NAME"], structure: "" } as Table],
        });
      }
    }
  }

  for (const schema of schemaList) {
    for (const table of schema.tables) {
      const { rows: result } = await client.execute(
        `
          SELECT COLUMN_NAME, DATA_TYPE, NULLABLE
          FROM ALL_TAB_COLUMNS
          WHERE TABLE_NAME = :tableName AND OWNER = :owner
        `,
        { tableName: table.name, owner: schema.name },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const columnList = [];
      for (const row of result) {
        columnList.push(`${row["COLUMN_NAME"]} ${row["DATA_TYPE"]} ${row["NULLABLE"] === "N" ? "NOT NULL" : ""}`);
      }

      let fullTableName = schema.name == "PUBLIC" ? `"${table.name}"` : `"${schema.name}"."${table.name}"`;
      table.structure = `CREATE TABLE ${fullTableName} (
${columnList.join(",\n")}
);`;
    }
  }

  await client.close();
  return schemaList;
};

const newConnector = (connection: Connection): Connector => {
  return {
    testConnection: () => testConnection(connection),
    execute: (databaseName: string, statement: string) => execute(connection, databaseName, statement),
    getDatabases: () => getDatabases(connection),
    getTableSchema: (databaseName: string) => getTableSchema(connection, databaseName),
  };
};

export default newConnector;
