  Meteor.startup(function () {
    // code to run on server at startup
	if (!Documents.findOne()) { //nodocuments
		Documents.insert({title:"my new document"});
	}
  });

     // publish a list of documents the user can se
  Meteor.publish("documents", function(){
    return Documents.find({
     $or:[
      {isPrivate:{$ne:true}}, 
      {owner:this.userId}
      ] 
    });
  })  
  // public sets of editing users
  Meteor.publish("editingUsers", function(){
    return EditingUsers.find();
  })

// coments on docs
Meteor.publish("comments", function(){
  return Comments.find();
})