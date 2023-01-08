const express = require("express")

const bodyParser = require("body-parser") 

const mongoose = require("mongoose")
mongoose.set('strictQuery', true);

const date = require(__dirname+"/date.js");


const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true})); 
app.use(express.static("public"));

const _ = require("lodash");
mongoose.connect("mongodb+srv://Arjunbackend1:yYkyfVRDGKZobEGv@backend1.qtt6evb.mongodb.net/todolistDB?retryWrites=true&w=majority",{useNewUrlParser:true});

const itemSchema ={
  name : String
}

const Item = mongoose.model("Item",itemSchema);

const item1 = new Item({
   name : "welcome to your to do list"
});

const item2 = new Item({
   name : "Hit the + button to add things"
});

const item3 = new Item({
   name : "<--hit this to delete a item"
});

const defaultItems = [item1,item2,item3];

const listSchema = {
   name : String,
   items:[itemSchema]
}

const List = mongoose.model("List",listSchema);

app.get("/",function(req, res){
   let day = date();
   Item.find(function(err,foundItem){
      if(foundItem.length===0){
         Item.insertMany(defaultItems,function(err){
          if(err){
            console.log(err);
          }
          else{
            console.log("successfully saved default items to database");
          }
          res.redirect("/");
        });
      }
     else res.render("list",{listTitle:day, newListItem:foundItem});
   })
}); 

app.get("/:customListName",function(req,res){
     const customListName = _.capitalize(req.params.customListName);
     List.findOne({name:customListName},function(err,foundlist){
       if(!err){
         if(!foundlist){
            const list = new List({
               name : customListName,
               items : defaultItems
              })
              list.save();
              res.redirect("/"+customListName);
         }
         else{
             res.render("list",{listTitle:foundlist.name, newListItem:foundlist.items});
         }
      }
     })
});


app.post("/",function(req,res){
    const itemName = req.body.newItem;
    const listName  = req.body.button;
    const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const d = new Date();
    let day = weekday[d.getDay()];
    const item = new Item({
       name : itemName
    })
    if(listName===day+","){
    item.save();
    res.redirect("/");
    }
    else{
      List.findOne({name : listName},function(err,foundlist){
           foundlist.items.push(item);
           foundlist.save();
           res.redirect("/"+listName);
      }); 
    }
})

app.post("/delete",function(req,res){
   const checkedItemId = req.body.checkbox;
   const listName = req.body.listName;
   
   const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
   const d = new Date();
   let day = weekday[d.getDay()];

    if(listName===day+","){
      Item.findByIdAndRemove(checkedItemId,function(err){
         if(err){
           console.log(err);
         }
         else{
          console.log("successfully deleted checked item");
          res.redirect("/");
         }
       })
    }
    else{
      List.findOneAndUpdate({name : listName},{$pull:{items : {_id:checkedItemId}}},function(err,foundlist){
      if(!err){
         res.redirect("/"+ listName);
      }
      });
    }
});

app.listen(3000,function(){
    console.log("server started on port 3000");
})  