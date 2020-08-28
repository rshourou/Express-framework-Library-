var BookInstance = require('../models/bookinstance');
var Book = require('../models/book');
const { body, validationResult } = require('express-validator/check');
const {sanitizeBody}=require('express-validator/filter');



// Display list of all BookInstances.
exports.bookinstance_list = function(req, res,next) {
    BookInstance.find().populate('book').exec(
        function(err, bookinstance_list){
            if (err) {return next(err);}
            return res.render('bookinstance_list',{title:'List of copies', bookinstance_list: bookinstance_list})
        }
    )
};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = function(req, res,next) {
    BookInstance.findById(req.params.id).
    populate('book').
    exec(function(err,book_instance){
        if (err) return next(err)
        if (book_instance==null){
            var err=new Error("Copy Not Found")
            err.status=404
            return next(err)
        }
        // Successful, so render.
        res.render('bookintance_detail',{title :"copy:"+ book_instance.book.title,book_instance:book_instance  })
    }

    )
   
};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = function(req, res, next) {       

    Book.find({},'title')
    .exec(function (err, books) {
      if (err) { return next(err); }
      // Successful, so render.
      res.render('bookinstance_form', {title: 'Create BookInstance', book_list: books});
    });
    
};
// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
    // Validate fields.
    body('book', 'Book must be specified').trim().isLength({ min: 1 }),
    body('imprint', 'Imprint must be specified').trim().isLength({ min: 1 }),
    body("due_back").optional({checkFalsy:true}).isISO8601(),

   // Sanitize fields.
   sanitizeBody('book').escape(),
   sanitizeBody('imprint').escape(),
   sanitizeBody('status').trim().escape(),
   sanitizeBody('due_back').toDate(),
   
   // Process request after validation and sanitization.
   (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a BookInstance object with escaped and trimmed data.
        var bookinstance= new BookInstance({
            book: req.body.book,
            imprint:req.body.imprint,
            status:req.body.status,
            due_back: req.body.due_back,
        });
        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values and error messages.

           Book.find({},'title').exec(function(err,books){
               if (err) {return next(err)};
               // Successful, so render.
               res.render('bookinstance_form', {title:"Bookinstance form", book_list:books,errors:errors.array(), book_instance:bookinstance, selected_book: bookinstance.book._id})
           })

           return;
        }
        else {
             // Data from form is valid.
            bookinstance.save(function(err){
                if (err) { return next(err); }
                // Successful - redirect to new record.
                res.redirect(bookinstance.url)
            });
            
        }
},

];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance delete GET');
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance delete POST');
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance update GET');
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance update POST');
};