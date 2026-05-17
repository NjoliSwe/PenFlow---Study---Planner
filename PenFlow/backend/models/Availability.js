const mongoose =
require("mongoose");

const availabilitySchema =
new mongoose.Schema({

userId:{
type:String,
required:true
},

dayOfWeek:Number,

startTime:String,

endTime:String

},
{
timestamps:true
}
);

module.exports =
mongoose.model(
"Availability",
availabilitySchema
);