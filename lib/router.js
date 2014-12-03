Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  notFoundTemplate: 'notFound',
  waitOn: function(){ return Meteor.subscribe('notifications'); }
});

Router.route('/new/:postsLimit?', {name: 'newPosts'});
Router.route('/clicked/:postsLimit?', {name: 'clickedPosts'});
Router.route('/best/:postsLimit?', {name: 'bestPosts'});

Router.route('/posts/:_id', {
  name: 'postPage',
  waitOn: function(){
    return [
      Meteor.subscribe('singlePost', this.params._id),
      Meteor.subscribe('comments', this.params._id)
    ];
  },
  data: function(){ return Posts.findOne(this.params._id); }
});


Router.route('posts/:_id/edit', {
  name: 'postEdit',
  waitOn: function(){
    return Meteor.subscribe('singlePost', this.params._id);
  },
  data: function(){ return Posts.findOne(this.params._id); }
});

Router.route('/submit', { name: 'postSubmit' });

PostsListController = RouteController.extend({
  template: 'postsList',
  increment: 5,
  postsLimit: function(){
    return parseInt(this.params.postsLimit) || this.increment;
  },
  findOptions: function(){
    return {sort: this.sort, limit: this.postsLimit()};
  },
  subscriptions: function(){
    this.postsSub = Meteor.subscribe('posts', this.findOptions());
  },
  posts: function(){
    return Posts.find({}, this.findOptions());
  },
  data: function(){
    var hasMore = this.posts().count() === this.postsLimit();
    var nextPath = this.route.path({postsLimit: this.postsLimit() + this.increment});
    return {
      posts: this.posts(),
      ready: this.postsSub.ready,
      nextPath: hasMore ? nextPath : null
    };
  }
});

NewPostsController = PostsListController.extend({
  sort: {submitted: -1, _id: -1},
  nextPath: function(){
    return Router.routes.newPosts.path({postsLimit: this.postsLimit() + this.increment});
  }
});

BestPostsController = PostsListController.extend({
  sort: {votes: -1, submitted: -1, _id: -1},
  nextPath: function(){
    return Router.routes.bestPosts.path({postsLimit: this.postsLimit() + this.increment});
  }
});

ClickedPostsController = PostsListController.extend({
  sort: {clicks: -1, submitted: -1, _id: -1},
  nextPath: function(){
    return Router.routes.clickedPosts.path({postsLimit: this.postsLimit() + this.increment});
  }
});

Router.route('/', {
  name: 'home',
  controller: NewPostsController
});


var requireLogin = function(){
  if (!Meteor.user()) {
    if (Meteor.loggingIn()) {
      this.render(this.loadingTemplate);
    } else {
      this.render('accessDenied');
    }
  } else {
    this.next();
  }
};

if(Meteor.isClient){
  Router.onBeforeAction('dataNotFound', { only: 'postPage' });
  Router.onBeforeAction(requireLogin, { only: 'postSubmit' });
}

// Server side routes
Router.route('/feed.xml', function(){
  var feed = new RSS({
    title: 'New Microscope Posts',
    description: 'The latest posts from Microscope, the smallest news aggregator.'
  });

  Posts.find({}, {sort: {submitted: -1}, limit: 20}).forEach(function(post){
    feed.item({
      title: post.title,
      description: post.body,
      author: post.author,
      date: post.submitted,
      url: '/posts/' + post._id
    })
  });

  this.response.end(feed.xml());
}, {
  where: 'server'
});

Router.route('/api/posts', function(){
  var parameters = this.request.query;
  var limit = Boolean(parameters.limit) ? parseInt(parameters.limit) : 20;
  var data = Posts.find({}, {limit: limit, fields: {title: 1, author: 1, url: 1, submitted: 1 }}).fetch();
  this.response.write(JSON.stringify(data));
  this.response.end();
}, {
  where: 'server'
});

Router.route('/api/post/:_id', function(){
  var post = Posts.findOne(this.params._id);
  if(!post){
    this.response.writeHead(404, {'Content-Type': 'text/html'});
    this.response.write('Post not found.');
    this.response.end();
    return;
  }

  this.response.write(JSON.stringify(post));
  this.response.end();
}, {
  where: 'server'
});
