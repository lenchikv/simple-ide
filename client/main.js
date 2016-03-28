Meteor.subscribe("documents");
Meteor.subscribe("editingUsers");
Meteor.subscribe("comments");

// set up the iron router
Router.configure({
  layoutTemplate: 'ApplicationLayout'
});

// 'home' page
Router.route('/', function () {
  console.log("you hit / ");
  this.render("navbar", {to:"header"});
  this.render("docList", {to:"main"});  
});

// individual document page
Router.route('/documents/:_id', function () {
  //console.log("you hit /documents  "+this.params._id);
  Session.set("docid", this.params._id);
  this.render("navbar", {to:"header"});
  this.render("docItem", {to:"main"});  
});
 


   var myVar;	
   Template.editor.helpers({
	docid:function(){
		setupCurrentDocument();
		return Session.get("docid");
		//console.log("Doc id helper");
		//console.log(Documents.findOne());
		//var doc =  Documents.findOne();
		//if (doc) {
		//	return doc._id;
		//} else {
	 	//	return underfined;
		//}
	},
	config:function(){
	 return function(editor){
         editor.setOption("lineNumbers", true);
         editor.setOption("theme", "cobalt");
         // set a callback that gets triggered whenever the user
         // makes a change in the code editing window
 	    editor.on("change", function(cm_editor, info) {
		//console.log(info);
		//console.log(cm_editor.getValue());
		
		$("#viewer_iframe").contents().find("html").html(cm_editor.getValue());	
		//Meteor.call("addEditingUser");
		Meteor.call("addEditingUser", Session.get("docid"));
		//EditingUsers.insert({user:"matthew"});
	     });
	   }
	},
	editors:function(){
		var editor_name =  EditingUsers.find().count();
	}
   });

 Template.editors.helpers({
    // retrieve a set of users that are editing this document
    users:function(){
      var doc, eusers, users;
      doc = Documents.findOne({_id:Session.get("docid")});
      if (!doc){return;}// give up
      eusers = EditingUsers.findOne({docid:doc._id});
      if (!eusers){return;}// give up
      users = new Array();
      var i = 0;
      for (var user_id in eusers.users){
          users[i] = fixObjectKeys(eusers.users[user_id]);
          i++;
      }
      return users;
    }
  })


  Template.navbar.helpers({
    // return a list of all visible documents
    documents:function(){
      return Documents.find();
    }
  })
   
  Template.editableText.helpers({
    // return true if I am allowed to edit the current doc, false otherwise
    userCanEdit : function(doc,Collection) {
      // can edit if the current doc is owned by me.
      doc = Documents.findOne({_id:Session.get("docid"), owner:Meteor.userId()});
      if (doc){
        return true;
      }
      else {
        return false;
      }
    }    
  })


  Template.docMeta.helpers({
    // return current document 
    document:function(){
      return Documents.findOne({_id:Session.get("docid")});
    }, 
    // return true if I am allowed to edit the current doc, false otherwise
    canEdit:function(){
      var doc;
      doc = Documents.findOne({_id:Session.get("docid")});
      if (doc){
        if (doc.owner == Meteor.userId()){
          return true;
        }
      }
      return false;
    }
  })


  Template.docList.helpers({
    // return a list of all visible documents
    documents:function(){
      return Documents.find();
    }
  })

  Template.insertCommentForm.helpers({
  // find current doc id
  docid:function(){
    return Session.get("docid");
  }, 
 })

 Template.commentList.helpers({
  // find all comments for current doc
  comments:function(){
    return Comments.find({docid:Session.get("docid")});
  }
})

   //////////////////
   /////    EVENTS
   /////////////////

   Template.navbar.events({
    // return a list of all visible documents
    "click .js-add-doc":function(event){
	event.preventDefault();
	Meteor.call('testMethod', function(){ 
  		console.log('method callback!');
	})
  console.log('After the method!');
	//console.log("Add a new doc!");
	if (!Meteor.user()){ //user not logged in
		alert("You need to login first!");
	} else {
	 //they are logged in, let's do inserting
	  var id =  Meteor.call("addDoc", function(err,res){
		if (!err){//all good
		 	console.log("event callback received "+res);
			Session.set("docid", res);
		}	
	     });
	}
     },
    // load a document link
    "click .js-load-doc":function(event){
      //console.log(this);
      Session.set("docid", this._id);
    }

  })


   //update the session current_date 
   // variable every 1000ms
   //Meteor.setInterval(function(){
//	 Session.set("current_date", new Date());
//	},1000);
	

///   Template.date_display.helpers({
//	current_date:function(){
//	//return new Date();
//	return Session.get("current_date");
//	},
//	myVar:function(){
//	    return myVar;
//	}
 //  });
  Template.docMeta.events({
    // toggle the private checkbox
    "click .js-tog-private":function(event){
      //console.log(event.target.checked);
      var doc = {_id:Session.get("docid"), isPrivate:event.target.checked};
      Meteor.call("updateDocPrivacy", doc);

    }
  })


// this renames object keys by removing hyphens to make the compatible 
// with spacebars. 
function fixObjectKeys(obj){
  var newObj = {};
  for (key in obj){
    var key2 = key.replace("-", "");
    newObj[key2] = obj[key];
  }
  return newObj;
}

// handy function that makes sure we have a document to work on
function setupCurrentDocument(){
  var doc;
  if (!Session.get("docid")){// no doc id set yet
    doc = Documents.findOne();
    if (doc){
      Session.set("docid", doc._id);
    }
  }
}
