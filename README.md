## Read and Write Google Spreadsheet

> A simple API for reading and writing Google Spreadsheets in Node.js
 
# install
```
 npm install read-write-google-spreadsheet
```

#Basic Usage

 *Note: Using the options `spreadsheetName` and `worksheetName` will cause lookups for `spreadsheetId` and `worksheetId`. Use `spreadsheetId` and `worksheetId` for improved performance.*
 
 ```
 var Spreadsheet = required('read-write-google-spreadsheet');
 var opts = {
      debug: true,
      spreadsheetId: '*************************************',
      worksheetId: '******',
      //spreadsheetName: '***********',
      //worksheetName: '******',
      oauth2: {
        client_id: '*************************',
        client_secret: '*********',
        refresh_token: '*********'
      }
    };
   var spreadsheet = new Spreadsheet(opts);
   
   spreadsheet.getHeader(function(err, result) { 
      -----
   }
 ```
