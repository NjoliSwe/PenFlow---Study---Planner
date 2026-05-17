const mongoose =
require("mongoose");

const courseSchema =
new mongoose.Schema({

userId:{
type:String,
required:true
},

name:{
type:String,
required:true
},

code:String,

color:{
type:String,
default:"#02C39A"
}

},
{
timestamps:true
}
);

module.exports =
mongoose.model(
"Course",
courseSchema
);