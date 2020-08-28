var Book = require('../models/book');
var Author = require('../models/author');
var Genre = require('../models/genre');
var BookInstance = require('../models/bookinstance');
const {body, validationResult }= require('express-validator/check')
const {sanitizeBody}= require('express-validator/filter')

var async = require('async');
const book = require('../models/book');

exports.index = function(req, res) {
    async.parallel({
        book_count: function(callback){
            Book.countDocuments({},callback)
        },
        book_instance_count:function(callback){
            BookInstance.countDocuments({},callback)
        },
        book_instance_available_count: function(callback){
            BookInstance.countDocuments({status:'Available'},callback)
        },
        author_count: function(callback) {
            Author.countDocuments({}, callback);
        },
        genre_count: function(callback) {
            Genre.countDocuments({}, callback);}

    },function(err, results){
        res.render('index', {title:'Local Library Home', data:results, error:err, })
    })
};

// Display list of all books.
exports.book_list = function(req, res) {
    Book.find({},'author title').populate('author').
    exec(function(err,list_books){
        if (err) {return async.nextTick(err);}
        //Successful, so render
        res.render('book_list',{title:'Book list', book_list:list_books})
        })
    }, function(err,results){
        res.render('books',{data:results, error:err})
    
};

// Display detail page for a specific book.
exports.book_detail = function(req, res,next) {
    async.parallel({
        book: function(callback){Book.findById(req.params.id).populate('author').populate('genre').exec(callback)} ,
        bookInstance: function(callback){BookInstance.find({'book':req.params.id}).exec(callback)},
    },function(err,results){
        if (err) {return next(err)}
        if(results.book==null){
            var err= new Error("Book Not Found");
            err.status=404;
            return next(Err)
        }
        res.render('book_detail', {book:results.book, book_instances: results.bookInstance, title: results.book.title })
    })      
};


// Display book create form on GET.
exports.book_create_get = function(req, res,next) {
    async.parallel({
        authors: function(callback) {
            Author.find(callback);

        },
        genres: function(callback){
            Genre.find(callback);
        },
    },function (err, results){
            if (err) {return next(err);}
            res.render('book_form', {title: "Book Form", authors:results.authors, genres:results.genres});
        }
    )    
};


/// Handle book create on POST.
exports.book_create_post = [
    // Convert the genre to an array.
    (req, res, next) => {
        if ( !req.body.genre instanceof Array){
            if (typeof req.body.genre===undefined)
            req.body.genre=[];
            else
            req.body.genre=new Array(req.body.genre);
        }
        next();
    },
    
    body('title', 'Title must not be empty.').trim().isLength({ min: 1 }),
    body('author', 'Author must not be empty.').trim().isLength({ min: 1 }),
    body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }),
    body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }),
  
    // Sanitize fields (using wildcard).
    sanitizeBody('*').escape(),
    // Process request after validation and sanitization.
    (req, res, next) => {
        const errors= validationResult(req);
        // Create a Book object with escaped and trimmed data.
        var book = new Book(
            { title: req.body.title,
              author: req.body.author,
              summary: req.body.summary,
              isbn: req.body.isbn,
              genre: req.body.genre
             });
             
        if(!errors.isEmpty()){
async.parallel({
    authors: function(callback) {
        Author.find(callback);

    },
    genres: function(callback){
        Genre.find(callback);
    },
            },
    function(err, results){
        if (err) {return next(err)}
        // Mark our selected genres as checked.
        for (let i = 0; i < results.genres.length; i++) {
            if (book.genre.indexOf(results.genres[i]._id) > -1) {
                results.genres[i].checked='true';
            }
        }
        res.render('book_form', {title: "Book Form", book:book, authors:results.authors, genres:results.genres, errors:errors.Array()});
    })
    return;
}     
        else{
            
                // Data from form is valid. Save book.
                book.save(function (err) {
                    if (err) { return next(err); }
                       //successful - redirect to new book record.
                       res.redirect(book.url);
                    });
        }
        
    }
]

// Display book delete form on GET.
exports.book_delete_get = function(req, res,next) {
    async.parallel({
        book:function(callback){ Book.findById(req.params.id).populate('author').populate('genre').exec(callback)},
        book_instances: function(callback){ BookInstance.find({'book':req.params.id}).exec(callback)}
    }, 
        
        function(err,results){
            if(err) return next(err);
            if (results.book==null){
                res.redirect('/catalog/books')
            }
            res.render('book_delete',{title:"Delete the book", book:results.book, book_instance: results.book_instances})
        })
};

// Handle book delete on POST.
exports.book_delete_post = function(req, res,next) {
    async.parallel({
        book:function(callback){ Book.findById(req.params.id).populate('author').populate('genre').exec(callback)},
        book_instances: function(callback){ BookInstance.find({'book':req.params.id}).exec(callback)}
    }, 
        function(err,results){
            if(err) return next(err);
            if (results.book_instances.length>0){
                res.render('book_delete',{title:"Delete the book", book:results.book, book_instance: results.book_instances})
                return
            }
            else{
                // Author has no books. Delete object and redirect to the list of authors.
                Book.findByIdAndRemove(req.body.bookid, function deleteBook(err){
                    if (err) return next(err);
                    // Success - go to book list
                    res.redirect('/catalog/books')
                })
            }
            
        })
};

// Display book update form on GET.
exports.book_update_get = function(req, res,next) {
    async.parallel({
        book: function(callback){ Book.findById(req.params.id).populate('author').populate('genre').exec(callback)},
        authors: function(callback) { Author.find(callback)},
        genres:function(callback) { Genre.find(callback)},


    },
         function(err,results){
             if (err) return next(err)
             if(results.book==null){
                 var error= new Error("Book Not Found")
                 error.status=404
                 return next(error)
             }
              // Success.
            // Mark our selected genres as checked
            for (i=0; i< results.genres.length; i++){
                for (j=0; j<results.book.genre.length ; j++){
                    if( results.book.genre[j]._id.toString() == results.genres[i]._id.toString()){
                        results.genres[i].checked=true
                    }
                }
            }
             
             res.render('book_form',{ title:"Update Book info", authors:results.authors, genres:results.genres, book:results.book})

    })
};

// Handle book update on POST.
exports.book_update_post = [
    // Convert the genre to an array.
    (req, res, next) => {

        if (!req.body.genre instanceof Array){
            if (typeof req.body.genre===undefined)
            req.body.genre=[];
            else
            req.body.genre=new Array(req.body.genre);
        }
        next();
    },
    
    
    body('title', 'Title must not be empty.').trim().isLength({ min: 1 }),
    body('author', 'Author must not be empty.').trim().isLength({ min: 1 }),
    body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }),
    body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }),
  
    // Sanitize fields (using wildcard).
    sanitizeBody('*').escape(),
    // Process request after validation and sanitization.
    (req, res, next) => {
        const errors= validationResult(req);
        // Create a Book object with escaped/trimmed data and old id.
        var book = new Book(
            { title: req.body.title,
              author: req.body.author,
              summary: req.body.summary,
              isbn: req.body.isbn,
              genre: (typeof req.body.genre==='undefined') ? [] : req.body.genre,
              _id:req.params.id //This is required, or a new ID will be assigned!
             });

        if(!errors.isEmpty()){
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
            async.parallel({
               
                authors: function(callback) { Author.find(callback)},
                genres:function(callback) { Genre.find(callback)},
                        },
    function(err, results){
        if (err) {return next(err)}
        // Mark our selected genres as checked.
        for (let i = 0; i < results.genres.length; i++) {
            if (book.genre.indexOf(results.genres[i]._id) > -1) {
                results.genres[i].checked='true';
            }
        }
        res.render('book_form', {title: "Book Form", book:book, authors:results.authors, genres:results.genres, errors:errors.Array()});
    })
    return;
}     
        else{
            Book.findByIdAndUpdate(req.params.id, book, {}, function(err,thebook){
                    if (err) { return next(err); }
                       //successful - redirect to new book record.
                       res.redirect(thebook.url);
                    });
        }
        
    }
]