// methods that provide write access to the data
Meteor.methods({

  addComment:function(comment){
    console.log("addComment method running!");
    if (this.userId){// we have a user
      comment.owner = this.userId;
        return Comments.insert(comment);
    }
    return;
  }, 



 // method to add a new document
  addDoc:function(){
    var doc;
//console.log("1"+this.user()._id);

console.log("2"+Meteor.userId);

console.log("3"+Meteor.user()._id);

console.log("4"+this.userId);

    if (!this.userId){// not logged in
      return;
    }
    else {
      doc = {owner:this.userId, createdOn:new Date(), 
            title:"my new doc"};
      var id = Documents.insert(doc);
      console.log("addDoc method: got an id "+id);
      return id;
    }
  },
  // method to change privacy flag on a docuement
  updateDocPrivacy:function(doc){
    console.log("updateDocPrivacy method");
    console.log(doc);
    var realDoc = Documents.findOne({_id:doc._id, owner:this.userId});
    if (realDoc){
      realDoc.isPrivate = doc.isPrivate;
      Documents.update({_id:doc._id}, realDoc);
    }

  },
// adding editors to a document
  addEditingUser:function(docid){
    var doc, user, eusers;
    //EditingUsers.insert({user:"matthew"});
    doc = Documents.findOne({_id:docid});
    if (!doc){return;}// no doc give up
    if (!this.userId){return;}// no logged in user give up
    // now I have a doc and possibly a user
    user = Meteor.user().profile;
    //user.lastEdit = new Date();
    eusers = EditingUsers.findOne({docid:doc._id});
    if (!eusers){
      eusers = {
        docid:doc._id, 
        users:{}, 
      };
    }

    
    eusers.users[this.userId] = user;

    EditingUsers.upsert({_id:eusers._id}, eusers);
 
  }
})
