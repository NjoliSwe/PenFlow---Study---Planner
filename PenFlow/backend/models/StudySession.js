const mongoose =
require("mongoose");

const studySessionSchema =
new mongoose.Schema({

userId:String,

courseId:String,

title:String,

scheduledDate:String,

startTime:String,

endTime:String,

status:{
type:String,
default:"pending"
},

isRescheduled:{
type:Boolean,
default:false
},

rescheduledFromId:String

},
{
timestamps:true
}
);

module.exports =mongoose.model("StudySession",
studySessionSchema
);