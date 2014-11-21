Template.postSubmit.events({
  'submit form': function(element) {
    element.preventDefault();

    var post = {
      url: $(element.target).find('[name=url]').val(),
      title: $(element.target).find('[name=title]').val()
    };

    var errors = validatePost(post);
    if(errors.title || errors.url) return Session.set('postSubmitErrors', errors);

    Meteor.call('postInsert', post, function(error, result){
      if(error) return Errors.throw(error.reason);
      if(result.postExists) throwError('This link has already been posted');
      Router.go('postsList', post);
    });
  }
});

Template.postSubmit.created = function(){
  Session.set('postSubmitErrors', {});
};

Template.postSubmit.helpers({
  errorMessage: function(field){
    return Session.get('postSubmitErrors')[field];
  },
  errorClass: function(field){
    return Boolean(Session.get('postSubmitErrors')[field]) ? 'has-error' : '';
  }
});
