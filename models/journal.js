const mongoose= require("mongoose")


const journalSchema = new mongoose.Schema({
    journalTitle:String,
	who:String,
	where:String,
	tag:String,
	subject:String
})

const journal= new mongoose.model('recipe',journalSchema)
module.exports=journal