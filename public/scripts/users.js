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
        var firstName = $("#first-name-input").val();
        var lastName = $("#last-description-input").val();
        var password = $("#password-input").val();
        var confirmPassword = $("#password-confirmation").val();
        var email = $("#email-input").val();
        var username = $("#username-input").val();
        var image = $("#imageInput")[0].files[0];
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
                    window.location.href = "/users";
            }
        });
    });
});