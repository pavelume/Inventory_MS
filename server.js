if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
  }

  const express = require('express')
  const app = express()
  const bcrypt = require('bcrypt')
  const passport = require('passport')
  const flash = require('express-flash')
  const session = require('express-session')
  const methodOverride = require('method-override')
  const mysql = require('mysql');
  const bodyparser = require('body-parser');
  const dotenv = require('dotenv');

  var port = process.env.PORT || 5000;
  app.use(bodyparser.json());

  var mysqlConnection = mysql.createConnection({
    host:'localhost',
    user: process.env.db_user_name,
    password: process.env.db_password,
    database: process.env.db_name
  });
  
  mysqlConnection.connect((err)=>{
    if(!err)
    console.log('DB connection succeeded')
    else
    console.log('DB connection failed \n Error :' + JSON.stringify(err,undefined,2));
  })






  const users = [];

    users.push({
      id: Date.now().toString(),
      name: 'Admin',
      email: process.env.login_id,
      password: process.env.login_password,
      role:0
    })

    users.push({
      id: Date.now().toString(),
      name: 'User',
      email: 'stuff@gmail.com',
      password: '1234',
      role:1
    })

    users.push({
      id: Date.now().toString(),
      name: 'User',
      email: 'test@gmail.com',
      password: '1234',
      role:1
    })

    users.push({
      id: Date.now().toString(),
      name: 'User',
      email: 'exam@gmail.com',
      password: '1234',
      role:1
    })
  






    // Passport Initialize

  const initializePassport = require('./passport-config')
const e = require('express')
const { Passport } = require('passport')
  initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
  )

  
  
 
  app.use( express.static( "public" ) )
  app.set('view-engine', 'ejs')
  app.use(express.urlencoded({ extended: false }))
  app.use(flash())
  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  }))
  app.use(passport.initialize())
  app.use(passport.session())
  app.use(methodOverride('_method'))

  
  app.get('/', adminAuth , (req, res) => {
    let sql1 = 'SELECT SUM(Amount) AS TotalItemsOrdered FROM orderstb';

    let query1= mysqlConnection.query(sql1, (err1, rows1, fields1)=>{
      if(!err1){
      console.log('Fetched total amount from orderstb')
      total_sales = rows1
      console.log(typeof(rows1))

      let sql2 = 'SELECT COUNT(ItemID) AS NumberOfProducts FROM orderstb';

      let query2= mysqlConnection.query(sql2, (err2, rows2, fields2)=>{
        if(!err2){
        ord_num = rows2
        console.log('Fetched total no. of orders from orderstb')

        let sql3 = 'SELECT COUNT(ItemID) AS NumberOfProducts FROM stocktb';

        let query3= mysqlConnection.query(sql3, (err3, rows3, fields3)=>{
        if(!err3){
        console.log('Fetched total no. of stocks from stocktb')
        stock_num = rows3

        let sql4 = 'SELECT SUM(Amount) AS TotalItemsOrdered FROM stocktb';
        let query4= mysqlConnection.query(sql4, (err4, rows4, fields4)=>{
          if(!err3){
            total_stock = rows4
            res.render('index.ejs',{
              total_sales:rows1,
              ord_num:rows2,
              stock_num:rows3,
              total_stock:rows4
              });
          }
          else
          console.log(err4);
       
        });
      }
      else
      console.log(err3);
    });

        }
        else
        console.log(err2);
      });


      }
      else
      console.log(err1);
    });
    
  })


  app.get("/userPage",userAuth,(req,res)=>{
    res.render("userPage.ejs");
  })
  
  app.get('/login', checkNotAuthenticated, (req, res) => {
    users.push({email:"testSazib"});
    res.render('login.ejs')
  })
  console.log(users);
  app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true
  }),(req,res)=>{
    const {email,password} = req.body;


    users.forEach((e)=>{
      if (e.email === email && e.password===password) {
        if (e.role == 1) {
          sss=req.session;
          sss.email=e.email;
          res.redirect("/billing");
          return;
        }
        if (e.role==0) {
          sss=req.session;
          sss.email=e.email;
          res.redirect("/");
          return;
        }
        res.render("/login");
      }
    })
  })
  
  app.get('/register', adminAuth, (req, res) => {
    res.render('register.ejs',{message:""})
  })
  
  app.post('/register', adminAuth ,(req, res) => {

    let email = req.body.email;

    let sql1=`SELECT * FROM accounttb`;
    console.log(email);
    let query1= mysqlConnection.query(sql1, (err, rows, fields)=>{
      if (!err) {
        rows.forEach((e)=>{
          if (e.Email==email) {
            console.log("Exist Email");
            res.render('register.ejs',{message:"Exist"})
          }
        })
      }
    })


      let role = 1;
      let sql = `INSERT INTO accounttb(Name,Email,Password,Role) VALUES ('${req.body.name}','${req.body.email}','${req.body.password}','${role}')`;
      let query = mysqlConnection.query(sql, (err, rows, fields) => {
        if(!err)
        {
          res.redirect('/');
        }
        else
        {
          console.log(err)
        }
    })
  })

  //Add New Category
  app.post('/addcategory',adminAuth,(req,res) => {
    let sql = `INSERT INTO categorytb(Category,Brand) VALUES ('${req.body.new}','${req.body.brandName}')`
    let query = mysqlConnection.query(sql, (err, rows, fields) => {
      if(!err)
      {
        res.redirect('/categories');
      }
      else
      console.log(err)
  })
  })

  
  app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
  })
  
  // function checkAuthenticated(req, res, next) {
  //   if (req.isAuthenticated()) {
  //     return next()
  //   }
  
  //   res.redirect('/login')
  // }
  
  function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      sss= req.session;
      if (sss.email === 'stuff@gmail.com' || sss.email === 'exam@gmail.com' || sss.email === 'test@gmail.com' ) {
        res.redirect("/billing");
        return;
      }
      if (sss.email==='admin@xyz.com') {
        res.redirect("/");
        return;
      }
    }
    next()
  }

  // auth midlleware start

  function userAuth(req,res,next) {

    if (req.isAuthenticated()) {
      sss= req.session;
      if (sss.email === 'stuff@gmail.com' || sss.email === 'exam@gmail.com' || sss.email === 'test@gmail.com') {
        next();
        return;
      }
      if (sss.email==='admin@xyz.com') {
        res.redirect("/");
        return;
      }
    }
    res.redirect("/login");
  }
  function adminAuth(req,res,next) {
    if(req.isAuthenticated()){
      sss = req.session;
      if(sss.email==='admin@xyz.com')
      {
        next();
        return;
      }
      if(sss.email ==='stuff@gmail.com')
      {
        return res.redirect("/billing");
      }
    }
    res.redirect("/login");
  }



// auth end





  app.listen(port, ()=>console.log(`Express Server is running at http://localhost:${port} port`))
  app.get('/employees', (req,res) =>{
    mysqlConnection.query('SELECT * FROM soldtb', (err, rows, fields)=>{
      if(!err)
      res.send(rows);
      else
      console.log(err);
    })
  })



//View Orders
  app.get('/orders', adminAuth ,(req,res) =>{
    let sql = 'SELECT TransactionID,SUM(Amount) as Amount,TransactionDate,TransactionTime FROM orderstb GROUP BY TransactionID';

    let query = mysqlConnection.query(sql, (err, rows, fields)=>{
      if(!err){
        let sql1 = 'SELECT * FROM orderstb'
        let query1 = mysqlConnection.query(sql1, (err1, rows1, fields1)=>{
          if(!err1){
            res.render('orders.ejs',{
              orders:rows, sub_orders:rows1, selected_item:'None', month_name:'None', year:'None'
            });
           }
           else
            console.log(err1)
        })
       
    }
      else
      console.log(err);
    });
  })
 
  





  //View Stocks
  app.get('/viewstocks', userAuth ,(req,res) =>{
    let sql = 'SELECT * FROM stocktb ORDER BY TYear DESC,Tmonth DESC, TDay DESC,StockTime DESC';

    let query = mysqlConnection.query(sql, (err, rows, fields)=>{
      if(!err){
        let sql1 = 'SELECT * FROM brandtb' 
        let query1 = mysqlConnection.query(sql1, (err1, rows1, fields1)=>{
          if(!err1){
            let sql2 = 'SELECT * FROM categorytb'
            let query2 = mysqlConnection.query(sql2, (err2, rows2, fields2)=>{
              if(!err2){
                res.render('viewstocks.ejs',{
                  all_stocks:rows, brands:rows1, categories:rows2,  display_content:'None', filter_type:'None', filter_name:'None'
                    });
                }
              else
              console.log(err2)
            })
      
        }
        else
        console.log(err1)
      })
    }
      else
      console.log(err);
    });
  })

  //Stocks Query Filter
  app.post('/stocks_query',userAuth , (req, res) => {
    let sql = 'SELECT * FROM stocktb ORDER BY TYear DESC,Tmonth DESC, TDay DESC,StockTime DESC';

    let query = mysqlConnection.query(sql, (err, rows, fields)=>{
      if(!err){
        let sql1 = 'SELECT * FROM brandtb' 
        let query1 = mysqlConnection.query(sql1, (err1, rows1, fields1)=>{
          if(!err1){
            let sql2 = 'SELECT * FROM categorytb'
            let query2 = mysqlConnection.query(sql2, (err2, rows2, fields2)=>{
              if(!err2){
                var selected_item = req.body['exampleRadios']
                if(selected_item == 'brand'){
                  var brand_name = req.body['selected_brand']
                  let sql3 = `SELECT * FROM stocktb WHERE Brand='${brand_name}'`
                  let query3 = mysqlConnection.query(sql3, (err3, rows3, fields3)=>{
                    if(!err3){
                      res.render('viewstocks.ejs',{
                        all_stocks:rows, brands:rows1, categories:rows2, display_content:rows3, filter_type:'brand', filter_name:brand_name
                          });
                    } 
                    else
                    console.log(err3)
                  })
                }

                if(selected_item == 'category'){
                  var category_name = req.body['selected_category']
                  let sql3 = `SELECT * FROM stocktb WHERE Category='${category_name}'`
                  let query3 = mysqlConnection.query(sql3, (err3, rows3, fields3)=>{
                    if(!err3){
                      res.render('viewstocks.ejs',{
                        all_stocks:rows, brands:rows1, categories:rows2, display_content:rows3, filter_type:'category', filter_name:category_name
                          });
                    } 
                    else
                    console.log(err3)
                  })
                }
              }
              else
              console.log(err2)
            })
      
        }
        else
        console.log(err1)
      })
    }
      else
      console.log(err);
    });
  })

  //Fetch Items by ID for billing
  app.post('/fetchitem',userAuth, (req, res) =>{
    item_id = req.body.itemid

    let sql = 'SELECT * FROM stocktb WHERE ItemID = ?'
    var response = {
      status  : 'success',
      success : 'Updated Successfully'
  }

    let query = mysqlConnection.query(sql, [item_id], (err, rows, fields)=>{
      if(!err)
      {
      console.log(rows)
      res.json({success : "Updated Successfully", status : 200, rows:rows});
      }
      else
      console.log(err);
    });
  })

  //Billing
  app.get('/billing',userAuth, (req, res) => {
    let sql1 = 'SELECT * FROM categorytb'
    
    let query1 = mysqlConnection.query(sql1, (err1, rows1, fields1)=>{
      if(!err1)
      {
        var category = rows1
        let sql2 = 'SELECT * FROM brandtb'
        let query2 = mysqlConnection.query(sql2, (err2, rows2, fields2)=>{
          if(!err2)
          {
            var brand = rows2
            let sql3 = 'SELECT * FROM modeltb'
            let query3 = mysqlConnection.query(sql3, (err3, rows3, fields3)=>{
              if(!err3)
              {
                var model = rows3
                res.render('bill.ejs',{category:category, brand:brand, model:model})
              }
              else
              console.log(err3)
            })
          }
          else
          console.log(err2)
        })
      }
      else
      console.log(err1)

    
  })
})

//Add New Category
  app.post('/addcategory',adminAuth,(req,res) => {
    let brandname = req.body.brandName;
    console.log(brandname);
    let sql = `INSERT INTO categorytb(Category,Brand) VALUES ('${req.body.new}','${brandname}')`;
    let query = mysqlConnection.query(sql, (err, rows, fields) => {
      if(!err)
      {
        res.redirect('/categories')
      }
      else
      console.log(err)
  })
  })

  //Add New Brand
  app.post('/addbrand',adminAuth,(req,res) => {
    let sql = `INSERT INTO brandtb(Brand) VALUES ('${req.body.new}')`
    let query = mysqlConnection.query(sql, (err, rows, fields) => {
      if(!err)
      {
        res.redirect('/brands')
      }
      else
      console.log(err)
  })
  })

  //Add New model
  app.post('/addmodel',adminAuth,(req,res) => {
    let sql = `INSERT INTO modeltb(model,Brand,Category) VALUES ('${req.body.new}','${req.body.brand}','${req.body.category}') `
    let query = mysqlConnection.query(sql, (err, rows, fields) => {
      if(!err)
      {
        res.redirect('/models')
      }
      else
      console.log(err)
  })
  })

  //Orders Filter Query
  app.post('/orders_query', adminAuth,(req,res) => {
    var time_type = req.body['exampleRadios']
    if (time_type == 'month'){
      var month= req.body['selected_month']
      var year = req.body['selected_year']

      const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
      var month_name = monthNames[parseInt(month-1)]

      let sql = `SELECT TransactionID,SUM(Amount) as Amount,TransactionDate,TransactionTime FROM orderstb WHERE TMonth = ${month} AND TYear = ${year} GROUP BY TransactionID`

      let query = mysqlConnection.query(sql, (err, rows, fields)=>{
        if(!err){
          let sql1 = 'SELECT * FROM orderstb'
          let query1 = mysqlConnection.query(sql1, (err1, rows1, fields1)=>{
            if(!err1){
              res.render('orders.ejs',{
                orders:rows, sub_orders:rows1, selected_item:'month', month_name:month_name, year:year
              });
             }
             else
              console.log(err1)
          })
         
      }
        else
        console.log(err);
      });
    }

    if (time_type == 'year'){
      
      var year = req.body['selected_year']

      let sql = `SELECT TransactionID,SUM(Amount) as Amount,TransactionDate,TransactionTime FROM orderstb WHERE TYear = ${year} GROUP BY TransactionID`

      let query = mysqlConnection.query(sql, (err, rows, fields)=>{
        if(!err){
          let sql1 = 'SELECT * FROM orderstb'
          let query1 = mysqlConnection.query(sql1, (err1, rows1, fields1)=>{
            if(!err1){
              res.render('orders.ejs',{
                orders:rows, sub_orders:rows1, selected_item:'year', month_name:'None', year:year
              });
             }
             else
              console.log(err1)
          })
         
      }
        else
        console.log(err);
      });
    }
  })


  // sales new filter 

  app.post("/ordersearch",(req,res)=>{
    

    let sql = `SELECT * FROM orderstb`;
    var response = {
      status  : 'success',
      success : 'Updated Successfully'
  }

    let query = mysqlConnection.query(sql,(err, rows, fields)=>{
      if(!err)
      {
      console.log(rows)
      res.json({success : "Updated Successfully", status : 200, rows:rows});
      }
      else
      console.log(err);
    });


  })


  // stock new filter 


  app.post("/stockReport",(req,res)=>{
    

    let sql = `SELECT * FROM stocktb`;
    var response = {
      status  : 'success',
      success : 'Updated Successfully'
  }

    let query = mysqlConnection.query(sql,(err, rows, fields)=>{
      if(!err)
      {
      console.log(rows)
      res.json({success : "Updated Successfully", status : 200, rows:rows});
      }
      else
      console.log(err);
    });


  })


  // Quantity Check 

  app.post("/quantityCheck",(req,res)=>{
    

    let sql = `SELECT * FROM stocktb`;
    var response = {
      status  : 'success',
      success : 'Updated Successfully'
  }

    let query = mysqlConnection.query(sql,(err, rows, fields)=>{
      if(!err)
      {
      console.log(rows)
      res.json({success : "Updated Successfully", status : 200, rows:rows});
      }
      else
      console.log(err);
    });


  })





  //Sales Filter
  app.get('/sales_filter', adminAuth,(req, res) => {
    rows = {}
    let sql = `SELECT * FROM orderstb`;
    let query = mysqlConnection.query(sql,(err,orderList,field)=>{
      res.render('sales_filter.ejs',{is_paramater_set : false,time_type: 'none', filter_type: 'none', display_content: rows, month_name: 'None', year:"None", total_amount:"None",orderList:orderList});
    })
    
  })

  app.get('/stock_filter', (req, res) => {
    let sql = 'SELECT * FROM categorytb';
    let sql1 = 'SELECT * FROM brandtb';

    let query = mysqlConnection.query(sql, (err, rows, fields)=>{
          if(!err)
          {
            let query1 = mysqlConnection.query(sql1,(err, rows1, fields)=>{
              if(!err)
              {
                  res.render('stock_filter.ejs', {category:rows,brand:rows1})
              }
              else
              console.log(err);
            });
          }
          else
          console.log(err);
        });

  })


  // // stock filter 

  // app.get('/viewstocks', userAuth ,(req,res) =>{
  //   let sql = 'SELECT * FROM categorytb';
  //   let sql1 = 'SELECT * FROM brandtb';

  //   let query = mysqlConnection.query(sql, (err, rows, fields)=>{
  //     if(!err)
  //     {
  //       let query1 = mysqlConnection.query(sql1,(err, rows1, fields)=>{
  //         if(!err)
  //         {

  //         }
  //         else
  //         console.log(err);
  //       });
  //     }
  //     else
  //     console.log(err);
  //   });



  // })







  //Stock Filter
  app.post('/stock_filter_query', adminAuth,(req, res) => {
    var filter_type = req.body['exampleRadios1']
    if(filter_type == 'brand'){
      let sql = 'SELECT Brand,count(*) AS Count,SUM(Amount) AS Amount FROM stocktb GROUP BY Brand'
      let query = mysqlConnection.query(sql, (err, rows, fields) => {
        if(!err)
        {
          let sql1 = 'SELECT count(*) AS Count FROM stocktb'
          let query1 = mysqlConnection.query(sql1, (err1, rows1, fields1) => {
            if(!err1)
            {
              res.render('stock_filter.ejs',{filter_type: filter_type,display_content: rows, total_items:rows1}) 
            }
            else
            console.log(err1)
          })
        }
        else
        console.log(err)
      })
    }
    if(filter_type == 'category'){
      let sql = 'SELECT Category,count(*) AS Count,SUM(Amount) AS Amount FROM stocktb GROUP BY Category'
      let query = mysqlConnection.query(sql, (err, rows, fields) => {
        if(!err)
        {
          let sql1 = 'SELECT count(*) AS Count FROM stocktb'
          let query1 = mysqlConnection.query(sql1, (err1, rows1, fields1) => {
            if(!err1)
            {
              res.render('stock_filter.ejs',{filter_type: filter_type,display_content: rows, total_items:rows1}) 
            }
            else
            console.log(err1)
          })
        }
        else
        console.log(err)
      })
    }
  })

  //Sales Filter
  app.post('/sales_filter_query', adminAuth,(req, res) => {
    var time_type = req.body['exampleRadios']

    if (time_type == 'month'){

      var month= req.body['selected_month']
      var year = req.body['selected_year']

      const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
      var month_name = monthNames[parseInt(month-1)]
      if (req.body['exampleRadios1'] == 'all'){
        
        let sql = `SELECT TransactionDate,count(*) as Count,SUM(Amount) as Amount FROM orderstb WHERE TMonth = ${month} AND TYear = ${year} GROUP BY TransactionDate`;
        let query = mysqlConnection.query(sql, (err, rows, fields) => {
          if(!err)
          {
            let sql1 = `SELECT SUM(Amount) as Amount,count(*) AS Count FROM orderstb WHERE TMonth = ${month} AND TYear = ${year}`
            let query1 = mysqlConnection.query(sql1, (err1, rows1, fields1) => {
              if(!err1)
              {
                var total_amount = rows1
                res.render('sales_filter.ejs',{is_paramater_set : true, time_type: 'month', filter_type: 'all', display_content: rows, month_name: month_name, year:year, total_amount:total_amount})
              }
              else
              console.log(err1)
            })
          }
          else
          console.log(err)
      })
      }

      if (req.body['exampleRadios1'] == 'brand'){
        
        let sql = `SELECT Brand,count(*) AS Count,SUM(Amount) as Amount FROM orderstb WHERE TMonth=${month} AND TYear = ${year} GROUP BY Brand`;
        let query = mysqlConnection.query(sql, (err, rows, fields) => {
          if(!err)
          {
            let sql1 = `SELECT SUM(Amount) as Amount,count(*) AS Count FROM orderstb WHERE TMonth = ${month} AND TYear = ${year}`
            let query1 = mysqlConnection.query(sql1, (err1, rows1, fields1) => {
              if(!err1)
              {
                var total_amount = rows1
                res.render('sales_filter.ejs',{is_paramater_set : true, time_type: 'month', filter_type: 'brand', display_content: rows, month_name: month_name, year:year, total_amount:total_amount})
              }
              else
              console.log(err1)
            })
          }
          else
          console.log(err)
      })
      }

      if (req.body['exampleRadios1'] == 'category'){
        
        let sql = `SELECT Category,count(*) AS Count,SUM(Amount) as Amount FROM orderstb WHERE TMonth=${month} AND TYear = ${year} GROUP BY Category`;
        let query = mysqlConnection.query(sql, (err, rows, fields) => {
          if(!err)
          {
            let sql1 = `SELECT SUM(Amount) as Amount,count(*) AS Count FROM orderstb WHERE TMonth = ${month} AND TYear = ${year}`
            let query1 = mysqlConnection.query(sql1, (err1, rows1, fields1) => {
              if(!err1)
              {
                var total_amount = rows1
                res.render('sales_filter.ejs',{is_paramater_set : true, time_type: 'month', filter_type: 'category', display_content: rows, month_name: month_name, year:year, total_amount:total_amount})
              }
              else
              console.log(err1)
            })
          }
          else
          console.log(err)
      })
      }
    }

    if (time_type == 'year')
      var year= req.body['selected_year']

      if (req.body['exampleRadios1'] == 'all'){
        
        let sql = `SELECT TMonth,count(*) as Count,SUM(Amount) as Amount FROM orderstb WHERE TYear = ${year} GROUP BY TMonth`;
        let query = mysqlConnection.query(sql, (err, rows, fields) => {
          if(!err)
          {
            let sql1 = `SELECT SUM(Amount) as Amount,count(*) AS Count FROM orderstb WHERE TYear = ${year}`
            let query1 = mysqlConnection.query(sql1, (err1, rows1, fields1) => {
              if(!err1)
              {
                var total_amount = rows1
                res.render('sales_filter.ejs',{is_paramater_set : true, time_type: 'year', filter_type: 'all', display_content: rows, month_name: 'None', year:year, total_amount:total_amount})
              }
              else
              console.log(err1)
            })
          }
          else
          console.log(err)
      })
      }

      if (req.body['exampleRadios1'] == 'brand'){
        
        let sql = `SELECT Brand,count(*) AS Count,SUM(Amount) as Amount FROM orderstb WHERE TYear = ${year} GROUP BY Brand`;
        let query = mysqlConnection.query(sql, (err, rows, fields) => {
          if(!err)
          {
            let sql1 = `SELECT SUM(Amount) as Amount,count(*) AS Count FROM orderstb WHERE TYear = ${year}`
            let query1 = mysqlConnection.query(sql1, (err1, rows1, fields1) => {
              if(!err1)
              {
                var total_amount = rows1
                res.render('sales_filter.ejs',{is_paramater_set : true, time_type: 'year', filter_type: 'brand', display_content: rows, month_name: 'None', year:year, total_amount:total_amount})
              }
              else
              console.log(err1)
            })
          }
          else
          console.log(err)
      })
      }

      if (req.body['exampleRadios1'] == 'category'){
        
        let sql = `SELECT Category,count(*) AS Count,SUM(Amount) as Amount FROM orderstb WHERE TYear = ${year} GROUP BY Category`;
        let query = mysqlConnection.query(sql, (err, rows, fields) => {
          if(!err)
          {
            let sql1 = `SELECT SUM(Amount) as Amount,count(*) AS Count FROM orderstb WHERE TYear = ${year}`
            let query1 = mysqlConnection.query(sql1, (err1, rows1, fields1) => {
              if(!err1)
              {
                var total_amount = rows1
                res.render('sales_filter.ejs',{is_paramater_set : true, time_type: 'year', filter_type: 'category', display_content: rows, month_name: 'None', year:year, total_amount:total_amount})
              }
              else
              console.log(err1)
            })
          }
          else
          console.log(err)
      })
    }

    
  })

  //View Categories
  app.get('/categories', adminAuth,(req, res) => {
    let sql1 = 'SELECT * FROM categorytb'
    let sql = 'SELECT * FROM brandtb'

    let query = mysqlConnection.query(sql, (err, rows, fields)=>{
      if(!err)
      {
          let query1 = mysqlConnection.query(sql1, (err1, rows1, fields1)=>{
            if(!err1)
            {
              var category = rows1
              console.log(rows);
              res.render('categories.ejs', {category:category,rows:rows});

            }
            else
            console.log(err1)
        })
      }
      else
      console.log(err)
  })
})

//View Brands
  app.get('/brands', adminAuth,(req, res) => {
    let sql2 = 'SELECT * FROM brandtb'
    let query2 = mysqlConnection.query(sql2, (err2, rows2, fields2)=>{
      if(!err2)
      {
        var brand = rows2
        res.render('brands.ejs',{brand:brand})
      }
      else
      console.log(err2)
  })
})

//View Models
  app.get('/models', adminAuth,(req, res) => {
    let sql1 = 'SELECT * FROM categorytb'
    
      let query1 = mysqlConnection.query(sql1, (err1, rows1, fields1)=>{
        if(!err1)
        {
          var category = rows1
          let sql2 = 'SELECT * FROM brandtb'
          let query2 = mysqlConnection.query(sql2, (err2, rows2, fields2)=>{
            if(!err2)
            {
              var brand = rows2
              let sql3 = 'SELECT * FROM modeltb'
              let query3 = mysqlConnection.query(sql3, (err3, rows3, fields3)=>{
                if(!err3)
                {
                  var model = rows3
                  res.render('models.ejs',{category:category, brand:brand, model:model})
                }
                else
                console.log(err3)
              })
            }
            else
            console.log(err2)
          })
        }
        else
        console.log(err1)

      
    })
  })

  //View Stocks
  app.get('/stocks', userAuth,(req, res) => {
    let sql1 = 'SELECT * FROM categorytb'
    
    let query1 = mysqlConnection.query(sql1, (err1, rows1, fields1)=>{
      if(!err1)
      {
        var category = rows1
        let sql2 = 'SELECT * FROM brandtb'
        let query2 = mysqlConnection.query(sql2, (err2, rows2, fields2)=>{
          if(!err2)
          {
            var brand = rows2
            let sql3 = 'SELECT * FROM modeltb'
            let query3 = mysqlConnection.query(sql3, (err3, rows3, fields3)=>{
              if(!err3)
              {
                var model = rows3
                res.render('stocks.ejs',{category:category, brand:brand, model:model})
              }
              else
              console.log(err3)
            })
          }
          else
          console.log(err2)
        })
      }
      else
      console.log(err1)

    
  })
    // res.render('stocks.ejs')
  })

  //Submit Bill
  app.post('/submitbill', userAuth,(req, res) => {


    var totalItem = req.body.totalItem.length;


    // if(totalItem==1)
    // {
    //   let itemId = req.body.ItemID;

    //   let qnt = `SELECT Quantity FROM stocktb WHERE ItemID = '${itemId}'`;

    //   let query = mysqlConnection.query(qnt,(err,quantity,fiels)=>{
    //     if (!err) {
    //       let qntval = quantity;
    //       if (parseInt(qntval[0].Quantity) < parseInt(req.body.itemQuantity) || parseInt(qntval[0].Quantity)<=0 ) {
    //         res.redirect("/billing");
    //         return;
    //       }
    //       else
    //       {
            
    //       }

    //     }
    //     else
    //     {
    //       console.log(err);
    //     }
    //   })
    // }
    // else
    // {
    //   for(let i=0;i<totalItem;i++)
    //   {
        
    //     let itemId = req.body.ItemID[i];

    //     let qnt = `SELECT Quantity FROM stocktb WHERE ItemID = '${itemId}'`;

    //     let query = mysqlConnection.query(qnt,(err,quantity,fiels)=>{
    //       if (!err) {
    //         let qntval = quantity;
    //         if (parseInt(qntval[0].Quantity) < parseInt(req.body.itemQuantity[i]) || parseInt(qntval[0].Quantity)<=0) {
    //           res.redirect("/billing");
    //           return;
    //         }
    //         else
    //         {
              
    //         }
    //       }
    //       else
    //       {
    //         console.log(err);
    //       }
    //     })
    //   }
    // }


    // store Data to database 


    var date_format = new Date();
    var transaction_date = date_format.getDate()+ '/' +(parseInt(date_format.getMonth()+1)).toString() + '/'+ date_format.getFullYear()
    var transaction_time = date_format.getHours() + ':' + date_format.getMinutes() + ':' + date_format.getSeconds()
    var transaction_id = "AIT"+ date_format.getDate() + date_format.getMonth() + date_format.getFullYear() + date_format.getHours() + date_format.getMinutes() + date_format.getSeconds()

    var ItemID= req.body.ItemID;
    var ItemName= req.body.itemName;
    var Category= req.body.itemCategory;
    var Brand= req.body.itemBrand;
    var model= req.body.itemModel;
    var Amount= req.body.itemAmount;
    var quantity = req.body.itemQuantity;
    var CustomerNumber= req.body.customerPhone;
    var TransactionDate= transaction_date;
    var TransactionTime= transaction_time;
    var TransactionID= transaction_id;
    var TDay= date_format.getDate();
    var TMonth= date_format.getMonth() + 1;
    var TYear= date_format.getFullYear();



    if(totalItem==1)
    {
      let itemId = req.body.ItemID;


      let qnt = `SELECT Quantity FROM stocktb WHERE ItemID = '${itemId}'`;

      let query = mysqlConnection.query(qnt,(err,qntity,fiels)=>{
        if (!err) {

          let qntValue = parseInt(qntity[0].Quantity)- parseInt(quantity);

          let updateInfo =`UPDATE stocktb SET Quantity = '${qntValue}' WHERE ItemID = '${itemId}'`;
          let query12 = mysqlConnection.query(updateInfo,(err,updateQNT,fiels)=>{
            if (!err) 
            {
              console.log("Sucessfully Update Quantity");
            }
            else
            {
              console.log(err);
            }
          })
          
          }
        else
        {
          console.log(err);
        }
      })
      

      let storeInfo = `INSERT INTO orderstb(ItemID,ItemName,Category,Brand,model,Amount,Quantity,CustomerNumber,TransactionDate,TransactionTime,TransactionID,TDay,TMonth,TYear) VALUES ('${ItemID}','${ItemName}','${Category}','${Brand}','${model}','${Amount}','${quantity}','${CustomerNumber}','${TransactionDate}','${TransactionTime}','${TransactionID}','${TDay}','${TMonth}','${TYear}')`;

      let query1 = mysqlConnection.query(storeInfo,(err,storeInfo,fiels)=>{
        if (!err) {
          console.log("Store Order Sucessfully");
          res.redirect("/billing");
          return;
        }
        else
        {
          console.log(err);
        }
      })


    }
    else
    {
      for(let i=0;i<totalItem;i++)
      {
        
        let qntVal = req.body.itemQuantity[i];
        let itemId = req.body.ItemID[i];


        let qnt = `SELECT Quantity FROM stocktb WHERE ItemID = '${itemId}'`;

        let querystore = mysqlConnection.query(qnt,(err,qntity,fiels)=>{
          if (!err) {
              let qntValue = parseInt(qntity[0].Quantity)- parseInt(req.body.itemQuantity[i]);
              let updateInfo =`UPDATE stocktb SET Quantity = '${parseInt(qntValue)}' WHERE ItemID = '${itemId}'`;

              let query = mysqlConnection.query(updateInfo,(err,quantity,fiels)=>{
                if (!err) {
                  console.log("Update Quantity Sucessfully");
                }
                else
                {
                  console.log(err);
                }
              })
            
            }
          else
          {
            console.log(err);
          }
        })

        // let updateInfo =`UPDATE stocktb SET Quantity = '${updateQuantity[i]}' WHERE ItemID = '${itemId}'`;

        // let query = mysqlConnection.query(updateInfo,(err,quantity,fiels)=>{
        //   if (!err) {
        //     console.log("Update Quantity Sucessfully");
        //   }
        //   else
        //   {
        //     console.log(err);
        //   }
        // })

        let storeInfo = `INSERT INTO orderstb(ItemID,ItemName,Category,Brand,model,Amount,Quantity,CustomerNumber,TransactionDate,TransactionTime,TransactionID,TDay,TMonth,TYear) VALUES ('${ItemID[i]}','${ItemName[i]}','${Category[i]}','${Brand[i]}','${model[i]}','${Amount[i]}','${quantity[i]}','${CustomerNumber}','${TransactionDate}','${TransactionTime}','${TransactionID}','${TDay}','${TMonth}','${TYear}')`;

        let query1 = mysqlConnection.query(storeInfo,(err,storeInfo,fiels)=>{
          if (!err) {
            console.log("Store Order Sucessfully");
          }
          else
          {
            console.log(err);
          }
        })


      }
      res.redirect("/billing");
    }

  })

  //Submit Stock
  app.post('/submitstock', userAuth,(req, res) => {

    var date_format = new Date();
    var transaction_date = date_format.getDate()+ '/'+ (parseInt(date_format.getMonth()+1)).toString() +'/'+date_format.getFullYear()
    console.log((parseInt(date_format.getMonth()+1)).toString())
    var transaction_time = date_format.getHours() + ':' + date_format.getMinutes() + ':' + date_format.getSeconds()




    let itemId = req.body.itemid1;
    let itemName = req.body.itemname1;
    let itemCategory = req.body.category1;
    let itemBrand = req.body.brand1;
    let itemModel= req.body.model1;
    let itemPrice = req.body.amount1;
    let itemQuantity = req.body.quantity;
    let itemStockDate = transaction_date;
    let itemStockTIme =transaction_time;
    let itemTmonth = date_format.getDate();
    let itemTDay = date_format.getMonth() + 1;
    let itemTYear = date_format.getFullYear();



      

    let sql = `INSERT INTO stocktb(ItemID,ItemName,Category,Brand,model,Amount,Quantity,StockDate,StockTime,TDay,TMonth,TYear) VALUES ('${itemId}','${itemName}','${itemCategory}','${itemBrand}','${itemModel}','${itemPrice}','${itemQuantity}','${itemStockDate}','${itemStockTIme}','${itemTmonth}','${itemTDay}','${itemTYear}')`

    let query = mysqlConnection.query(sql,(err, rows, fields)=>{
      if(!err)
      {
      console.log('Successfully inserted values')
      res.redirect('/viewstocks')
      }
      else
      console.log(err);
    });
  })

  //Delete Order
  app.post('/deleteitem', adminAuth,(req,res) => {
    console.log('deleteitem called')
    var deleteid = req.body.deleteid
    let sql = 'DELETE FROM orderstb WHERE TransactionID = ?'
    let query = mysqlConnection.query(sql,[ deleteid], (err, rows, fields)=>{
      if(!err)
      {
      console.log('Successfully deleted a value')
      res.redirect('/orders')
      
      }
      else
      console.log(err);
    });
  })

  //Delete Category
  app.post('/deletecategory', adminAuth,(req,res) => {

    var deleteid = req.body.deleteid
    let sql = 'DELETE FROM categorytb WHERE Category = ?'
    let query = mysqlConnection.query(sql,[ deleteid], (err, rows, fields)=>{
      if(!err)
      {
      console.log('Successfully deleted a category')
      res.redirect('/categories')
      
      }
      else
      console.log(err);
    });
  })

  //Delete Brand
  app.post('/deletebrand', adminAuth,(req,res) => {
    console.log('deletebrand called')
    var deleteid = req.body.deleteid
    let sql = 'DELETE FROM brandtb WHERE Brand = ?'
    let query = mysqlConnection.query(sql,[ deleteid], (err, rows, fields)=>{
      if(!err)
      {
      console.log('Successfully deleted a brand')
      res.redirect('/brands')
      
      }
      else
      console.log(err);
    });
  })

  //Delete Models
  app.post('/deletemodel', adminAuth,(req,res) => {
    console.log('deletemodel called')
    var deleteid = req.body.deleteid
    let sql = 'DELETE FROM modeltb WHERE model = ?'
    let query = mysqlConnection.query(sql,[ deleteid], (err, rows, fields)=>{
      if(!err)
      {
      console.log('Successfully deleted a model')
      res.redirect('/models')
      
      }
      else
      console.log(err);
    });
  })

  //Delete Stock
  app.post('/deletestock', userAuth,(req,res) => {
    console.log('deleteitem called')
    var deleteid = req.body.deleteid
    let sql = 'DELETE FROM stocktb WHERE ItemID = ?'
    let query = mysqlConnection.query(sql,[ deleteid], (err, rows, fields)=>{
      if(!err)
      {
      console.log('Successfully deleted a value')
      res.redirect('/viewstocks')
      
      }
      else
      console.log(err);
    });
  })

app.get("/accountRegister",(req,res)=>{

  let sql=`SELECT * FROM accounttb`;

  let query = mysqlConnection.query(sql,(err, rows, fields)=>{
    if(!err)
    {
      console.log('Successfully deleted a value')
      res.render("accountRegister.ejs",{rows:rows});
    
    }
    else
    console.log(err);
  });
})