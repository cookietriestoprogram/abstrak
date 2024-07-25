$(document).ready(function(){
    $(".exit").click(function(event){
        $(".add-user-modal").hide();
    });

    $(".add-button").click(function(event){
        $(".add-user-modal").show();
    })
});