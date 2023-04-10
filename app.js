const express= require('express')
const mongoose = require('mongoose')
const mongoDb = require('mongodb')
const bodyParser = require('body-parser') 
const app = express()
const _ = require('lodash')
//Set express app preferneces

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static('public'))

mongoose.set('bufferCommands', false)
mongoose.set('strictQuery',false)


async function connect() {

  await mongoose.connect('mongodb+srv://QuarkyQuo:ksk101202@cluster0.zqt7i2n.mongodb.net/toDoListDB?retryWrites=true&w=majority',{useNewUrlParser:true,useUnifiedTopology:true})

    const taskSchema =await new mongoose.Schema({
        task:{
          type:String, required:[true,'Name field cannot be empty'], 
          unique:true
        },
        time:{
            entry:{  type:Date, required:[true,'Unable to identify entry time'],default: Date.now()  },
            Due:{type:Date,required:false}
        },
        Workspace:{
            type:String, required:[true,'workspace field cannot be empty'], 
            unique:false , default:'TO DO LIST'
        }
        })
    
    const taskData =await mongoose.model('taskData',taskSchema)

    var toDoTaskRecords =await taskData.find({Workspace:'TO DO LIST'})
    var workTaskRecords =await taskData.find({Workspace:'WORK'})
    

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get('/',(req,res)=>{
    dayName=['sunday','monday','tuesday','wednesday','thursday','friday','saturday']
    monthName=['January','February','March','April','May','June','Julay','August','September','October','November','December']
    var today = new Date
    var day = today.getDate()+' '+monthName[today.getMonth()]+' '+today.getFullYear()
    // res.render('list',{pageRoot:'TO DO LIST',kindOfDay:day,newItem:items,timeNow:timeArray}) 
    res.render('listDB',{pageRoot:'TO DO LIST',kindOfDay:day,tasks:toDoTaskRecords})   
     
})

app.post('/',async (req,res)=>{
item= req.body.task 
due = req.body.due
var today=new Date
const time =today.getHours()+':'+today.getMinutes()+':'+today.getSeconds()

if(req.body.root==='WORK'){


    const newTask=await new taskData({
        task: item,
        time: {
            entry: today,
            Due: due
        },
        Workspace: 'WORK'
    })
     await newTask.save().catch(console.dir)
     workTaskRecords=await  taskData.find({Workspace:'WORK'}).catch(console.dir)
    


    await res.redirect('/work')
}else if(req.body.root==='TO DO LIST') {

    const newTask=await new taskData({
        task:item,
        time:{
            entry:today,
            Due:due
        },
        Workspace:'TO DO LIST'

    })
    await newTask.save().catch(console.dir)
    toDoTaskRecords=await taskData.find({Workspace:'TO DO LIST'}).catch(console.dir)

    
    // const toDoTaskRecords= taskData.find({Workspace:'TO DO LIST'})
    // const workTaskRecords= taskData.find({Workspace:'WORK'})
       res.redirect('/')
}
else{
    
    const newTask=await new taskData({
        task: item,
        time: {
            entry: today,
            Due: due
        },
        Workspace: req.body.root
    })
     await newTask.save().catch(console.dir)
     await res.redirect('/'+req.body.root)
}

})

app.get('/work',(req,res)=>{
    dayName=['sunday','monday','tuesday','wednesday','thursday','friday','saturday']
    monthName=['January','February','March','April','May','June','Julay','August','September','October','November','December']
    var today = new Date
    var day = today.getDate()+' '+monthName[today.getMonth()]+' '+today.getFullYear()
    res.render('listDB',{pageRoot:'WORK',kindOfDay:day,tasks:workTaskRecords})
})


app.post('/delete',async (req,res)=>{
 var rout = await taskData.findOne({_id:req.body.checkbox}).select({Workspace:1,_id:0})
 await taskData.deleteOne({_id: req.body.checkbox}).catch(console.dir)
 toDoTaskRecords =await taskData.find({Workspace:'TO DO LIST'})
 workTaskRecords =await taskData.find({Workspace:'WORK'})
if(rout.Workspace==='TO DO LIST'){
    await res.redirect('/')
}else{
    await res.redirect(rout.Workspace)
}
})

app.post('/workspace',(req,res)=>{
    const newWorkspace= req.body.newWorkspace
    res.redirect('/'+newWorkspace)
})
app.get('/:workspace',async (req,res)=>{
    const routs=await req.params.workspace
    if(routs !=='/'){
       var TaskRecords=await taskData.find({Workspace:routs})
        dayName=['sunday','monday','tuesday','wednesday','thursday','friday','saturday']
        monthName=['January','February','March','April','May','June','Julay','August','September','October','November','December']
        var today = new Date
        var day = today.getDate()+' '+monthName[today.getMonth()]+' '+today.getFullYear()
       await res.render('listDB',{pageRoot:routs ,kindOfDay:day,tasks:TaskRecords})

    }
})

}
connect()

//   setTimeout( function () {
//     mongoose.disconnect();
//   }, 1000)
app.listen(3000,()=>{
    console.log('server started on port 3000')
})