Template.postSubmit.events({
  'submit form': function(element) {
    element.preventDefault();

    var post = {
      url: $(element.target).find('[name=url]').val(),
      title: $(element.target).find('[name=title]').val()
    };

    post._id = Posts.insert(post);
    Router.go('postPage', post);
  }
});
