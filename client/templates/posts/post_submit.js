Template.postSubmit.events({
  'submit form': function(element) {
    element.preventDefault();

    var post = {
      url: $(element.target).find('[name=url]').val(),
      title: $(element.target).find('[name=title]').val()
    };

    Meteor.call('postInsert', post, function(error, result){
      if(error) return throwError(error.reason);
      if(result.postExists) throwError('This link has already been posted');
      Router.go('postsList', post);
    });
  }
});
