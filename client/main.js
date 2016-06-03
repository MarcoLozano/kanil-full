import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import './main.html';

import { Accounts } from 'meteor/accounts-base';

Accounts.ui.config({
  passwordSignupFields: 'USERNAME_ONLY',
});


Template.hello.onCreated(function helloOnCreated() {
  // counter starts at 0
  this.counter = new ReactiveVar(0);
});
     Tasks.insert({
       text,
       createdAt: new Date(), // current time
      owner: Meteor.userId(),
    username: Meteor.user().username,
     });
Template.hello.helpers({
  counter() {
    return Template.instance().counter.get();
  },
});
Template.hello.events({
  'click button'(event, instance) {
    // increment the counter when button is clicked
    instance.counter.set(instance.counter.get() + 1);
  },
});
Tasks = new Mongo.Collection("tasks");

if(Meteor.isServer){
  Meteor.publish("tasks", function(){
    return Tasks.find({$or:[{private: {$ne: true}}, { owner: this.userId}]});
  });
}

if(Meteor.isClient){

  Meteor.subscribe("tasks");

  Template.body.helpers({
    tasks: function(){
      if(Session.get("hideCompleted")){
        return Tasks.find({checked: {$ne: true}}, {sort:{createdAt: -1}});
      }else{
        return Tasks.find({}, {sort:{createdAt: -1}});
      }
    },
    hideCompleted: function(){
      return Session.get("hideCompleted");
    }
  });

  Template.body.events({
    "submit .new-task": function(event){
      event.preventDefault();

      var text = event.target.text.value;

      Meteor.call("addTask", text);

      event.target.text.value = "";
    },
    "change .hide-completed input": function(event){
      Session.set("hideCompleted", event.target.checked);
    }
  });


  Template.task.helpers({
    isOwner: function(){
      return this.owner === Meteor.userId();
    }
  });



  Template.task.events({
    "click .toggle-checked": function(){
      /*Tasks.update(this._id, {
        $set: {checked: ! this.checked}
      });*/
      
      Meteor.call("setChecked", this._id, ! this.checked);
    },
    "click .delete": function(){
      /*Tasks.remove(this._id);*/
      Meteor.call("deleteTask", this._id);
    },
    "click .toggle-private": function(){
      Meteor.call("setPrivate", this._id, ! this.private);
    }
  });

   Accounts.ui.config({
      passwordSignupFields: "USERNAME_ONLY"
    });
}


Meteor.methods({
  addTask: function(text){
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Tasks.insert({
      text: text,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
    });
  },
  deleteTask: function(taskId){
    var task = Tasks.findOne(taskId);
    console.log(task);
    if(!task.private && task.owner !== Meteor.userId()){

      throw new Meteor.Error("not-authorized");
    }else{
      Tasks.remove(taskId);
    }
    
  },
  setChecked: function(taskId, setChecked){
    var task = Tasks.findOne(taskId);
    console.log(task);
    console.log(task.owner);
    console.log(task.private);
    if(!task.private && task.owner !== Meteor.userId()){
      throw new Meteor.Error("not-authorized");
    }

    Tasks.update(taskId, {$set: {checked: setChecked}});
  },
  setPrivate: function(taskId, setToPrivate){
    var task = Tasks.findOne(taskId);

    if(task.owner !== Meteor.userId()){
      throw new Meteor.Error("not-authorized");
    }
    
    Tasks.update(taskId, {$set: {private: setToPrivate}});
  }
});
