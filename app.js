const express = require("express");
const bodyParser = require("body-parser");
// const path = require("path");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
mongoose.set("strictQuery", true);
app.set("view engine", "ejs"); //2) no spelling mistake happens is needed

// const viewpath = path.join(__dirname, "/views");
// console.log(viewpath);
// app.set("views", viewpath);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/tolostDB");

const itemsSchema = {
  name: String,
};

const Item = mongoose.model("Itm", itemsSchema);

const itm1 = new Item({
  name: "Welcome to my todo list",
});

const itm2 = new Item({
  name: "hit + to add new item",
});

const itm3 = new Item({
  name: "<-- hit this to delete item",
});

const defualtitem = [itm1, itm2, itm3];

const listSchema = {
  name: String,
  items: [itemsSchema],
};

const List = mongoose.model("List", listSchema);

// 4) app.use(express.static.("public"));

let workitm = [];
app.get("/", function (req, res) {
  // let day = date.getdate(); //1) if we don't write perenthisish then fuction will nor run

  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defualtitem, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("defualt data insert succesfully");
        }
      });
    } else {
      // console.log(foundItems);
      res.render("list", { tol: "Today", newitm: foundItems });
    }
  });

  //1) 'list.ejs' file must be in views directory
});

app.post("/", function (req, res) {
  const itmname = req.body.newitm;
  const listname = req.body.list;

  const item = new Item({
    name: itmname,
  });

  if (listname === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listname }, function (err, foundList) {
      // 'findOne' find customListName if exit it return 'foundlist'
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listname);
    });
  }
});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(req.body.checkbox, function (err) {
      //2) if you don't provide callback it can;t delete
      if (err) {
        console.log("succesfully Deleted");
      }
    });
    res.redirect("/");
  } else {
    //1) findOneAndUpdate() for remove element from array
    // <Modelname>.findOneAndUpdate(
    //   {condition},
    //1) {updatrs}, --> {$pull:{field:{query}}} --> {$pull:{field:{_id:values}}}
    // 3) here fiels is array of our item and query means which item we want to pull
    //   fuction(err,results){}
    // );
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } },
      function (err, foundList) {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

//1) Dynemic Routes
//1) Syntax of express route parameters
// app.get("/category/:<paramName>",function(req,res){
//   access req.params.paramName
// });

app.get("/:customListName", function (req, res) {
  const customListName = req.params.customListName;

  List.findOne({ name: customListName }, function (err, foundList) {
    // 'findOne' find customListName if exit it return 'foundlist'

    if (!err) {
      if (!foundList) {
        // create new list
        const list = new List({
          name: customListName,
          items: defualtitem,
        });

        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", { tol: foundList.name, newitm: foundList.items });
      }
    }
  });
});

app.listen(3000, function () {
  console.log("server satrted at 3000");
});
