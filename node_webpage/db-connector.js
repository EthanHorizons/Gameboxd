// Get an instance of mysql we can use in the app
let mysql = require('mysql2')

// Create a 'connection pool' using the provided credentials
const pool = mysql.createPool({
    waitForConnections: true,
    connectionLimit   : 100,
    host              : 'classmysql.engr.oregonstate.edu',
    user              : 'cs340_ossanae',
    password          : '0552',
    database          : 'cs340_ossanae'
}).promise(); // This makes it so we can use async / await rather than callbacks

// Export it for use in our application
module.exports = pool;