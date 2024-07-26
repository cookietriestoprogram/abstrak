$(document).ready(function(){
    $(".exit").click(function(event){
        $(".add-user-modal").hide();
    });

    $(".add-button").click(function(event){
        $(".add-user-modal").show();
    })

    $(".main-picture").click(function(event){
        $("#imageInput").click();
    });

    $("#imageInput").click(function(event){
        event.stopPropagation();
    });

    $("#imageInput").change(function(event){
        var file = this.files[0];
        var reader = new FileReader();
        
        $(".user-photo-container").remove();

        mediaContainer = $(".main-picture")
        reader.onload = function(e){
            const photoContainer = document.createElement('div');
            photoContainer.className = 'user-photo-container';

            const img = document.createElement('img');
            img.src = e.target.result;
            img.className = 'user-photo';
            photoContainer.appendChild(img);

            mediaContainer.append(photoContainer);

        }
        reader.readAsDataURL(file);
    });

    $(".submit-user-button").click(function(){
        var firstName = JSON.parse($("#first-name-input").val());
        var lastName = JSON.parse($("#last-name-input").val());
        var password = JSON.parse($("#password-input").val());
        var confirmPassword = $("#password-confirmation").val();
        var email = $("#email-input").val();
        var username = $("#username-input").val();
        var image = JSON.stringify($("#imageInput")[0].files[0]);
        var formData = new FormData();
        formData.append("firstName", firstName);
        formData.append("lastName", lastName);
        formData.append("password", password);
        formData.append("confirmPassword", confirmPassword);
        formData.append("email", email);
        formData.append("username", username);
        formData.append("profilePicture", image);
        $.ajax({
            url: "/api/users/add",
            type: "POST",
            data: formData,
            contentType: false,
            processData: false,
            success: function(data){
                if(data.success)
                    location.reload();
            }
        });
    });

    $('.text-input').on('keyup', validateField);
});

// Helper functions
function validateField(){
    if($(this).val() === "") {
        $(this).removeClass('correct-input').addClass('wrong-input');
    } else {
        $(this).removeClass('wrong-input').addClass('correct-input');
    }
}