export default () => ({
  server: {
    port: process.env.PORT || 3001,
  },
  database: {
    connectionString: process.env.DB_CONNECTION_STRING,
  },
});
