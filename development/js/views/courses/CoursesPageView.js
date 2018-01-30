define([
    'dataStore',
    'js/views/PageView',
    'text!js/views/courses/Courses.html'

], function(
        dataStore, 
        PageView,
        CoursesTemplate
    ){

    var CoursesView = PageView.extend({
        name:"Courses",
        initialize: function(options)
        {
            PageView.prototype.initialize.apply(this, [options]);
            this.template = _.template(CoursesTemplate);
        },
        events:
        {

        },
        renderPageContent: function()
        {
            $(this.el).html(this.template());
        }
        
    });

    return CoursesView;
});