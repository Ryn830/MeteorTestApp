Template.postItem.helpers({
  ownPost: function(){
    return this.userId === Meteor.userId();
  },
  domain: function(){
    var a = document.createElement('a');
    a.href = this.url;
    return a.hostname;
  },
  upvotedClass: function(){
    var userId = Meteor.userId();
    if(userId && !_.include(this.upvoters, userId)){
      return 'btn-primary upvotable';
    }
    return 'disabled';
  },
  postUrl: function(){
    return this.shortUrl ? this.shortUrl : this.url;
  }
});

Template.postItem.events({
  'click .upvotable': function(event){
    event.preventDefault();
    Meteor.call('upvote', this._id);
  }
});
