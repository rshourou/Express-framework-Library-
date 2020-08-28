//Import the mongoose module
var mongoose = require('mongoose');

//Set up default mongoose connection
var mongoDB = 'mongodb+srv://Royash:1234@cluster0.7jcnk.mongodb.net/local_library?retryWrites=true&w=majority';
mongoose.connect(mongoDB, { useNewUrlParser: true });

//Get the default connection
var db= mongoose.connection

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var author = require('./models/author');
var genre = require('./models/genre');
var book = require('./models/book');
var bookinstance = require('./models/bookinstance');

var fiction= new genre({
    name: {
        type: 'fiction'
    }
})

fiction.save(err=>{
    if (err) return handleError(err);
})
genre.create({type: 'Drama'
}, function(err, drama){
    if (err) return handleError(err)
})

var author1= new author({
    first_name: 'Brian',
    family_name: 'Trasi',
    date_of_birth: '1990-04-12',
    date_of_death: '2060-05-12'
})
author1.save(err=>{
    if (err) return handleError(err);
})



var book1 = new  book({
    title: 'Love or hurt',
    author: author1._id,
    summary: 'This is the first book ever',
    isbn: '2134hy8y5yhtogr',
    genre: [fiction._id]
})
book1.save(err=>{
    if (err) return handleError(err);
})

/*libraryModel.find({'name':'Alex'})
query.select('firstname lastname')
query.limit(5)
query.sort({'age':-1})
query.exec(function(err, Athletics){
    if (err) return handleError(err)
})

libraryModel.find().where('name').equals('alex').
where('age').gt(18).lt(50).
limit(5).
sort({age :-1}).
select('name lastname').exec()



var authorSchema=  Schema({
    name: String,
    story: [{type: Schema.Types.ObjectId , ref:'storySchema'}]
})

var storySchema=  Schema({
    title:String,
    author: {type:Schema.Types.ObjectId, ref:'authorSchema'}
})

var authorModel= mongoose.model('authorModel',authorSchema)
var storyModel=mongoose.model('storyModel', storySchema)

authorModel.create({name:'Rose Mackenzie'}, function(err, author1){
    if(err) return handleError(err)
})

var story1= new storyModel({
    title: 'HelloWorld',
    author: author1._id
})
story1.save(function(err){
    if(err) return handleError(err)
})

storyModel.findOne({title:'HelloWorld'}).
populate('author').exec((err)=>{
    if(err) return handleError(err,storyquery)
    console.log(storyquery.author.name)
})
*/