const mongoose =
require("mongoose");

const reminderSettingsSchema =
new mongoose.Schema({

userId:String,

studyReminderMinutes:{
type:Number,
default:30
},

deadlineReminderDays:{
type:Number,
default:1
}

});

module.exports =
mongoose.model(
"ReminderSettings",
reminderSettingsSchema
);