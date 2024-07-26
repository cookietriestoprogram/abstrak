$(document).ready(function(){
    $(".exit").click(function(event){
        $(".add-user-modal").hide();
        $(".admin-roles").hide();
        $(".non-admin-roles").hide();
    });

    $("#add-admin-button").click(function(event){
        $(".add-user-modal").show();
        $(".admin-roles").show();
        document.querySelector(".admin-roles").selected = true;
    })

    $("#add-non-admin-button").click(function(event){
        $(".add-user-modal").show();
        $(".non-admin-roles").show();
        
        document.querySelector(".non-admin-roles").selected = true;
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
        
        if(checkPassword()) {
            var firstName = $("#firstName-input").val();
            var lastName = $("#lastName-input").val();
            var password = $("#password").val();
            var confirmPassword = $("#password-confirmation").val();
            var email = $("#email-input").val();
            var username = $("#username").val();
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
                    Swal.fire({
                        icon: 'success',
                        title: 'User Created',
                        text: 'The user has been created successfully.',
                        showConfirmButton: false // Hide the default "OK" button
                    });
        
                    // Close the modal after 3 seconds (for example)
                    setTimeout(() => {
                        Swal.close(); 
                        window.location.reload();
                    }, 1500);
                },
                error: function(xhr, status, error) {
                    Swal.fire('Error', 'There was an error creating the user.', 'error');
                }
            });
        } else {
            Swal.fire('Error', 'Password does not match!');
        }
    });

    $('.text-input').on('keyup', validateField);

    $('#password-confirmation').on('keyup', checkPassword);
});

// Helper functions
function validateField(){
    if($(this).val() === "") {
        $(this).removeClass('correct-input').addClass('wrong-input');
    } else {
        $(this).removeClass('wrong-input').addClass('correct-input');
    }
}
function checkPassword() {
    const password = $('#password').val();
    const confirmation = $('#password-confirmation').val();

    if (password === confirmation) {
        $('#password').removeClass('wrong-input').addClass('correct-input');
        $('#password-confirmation').removeClass('wrong-input').addClass('correct-input');
        return true;
    } else {
        $('#password').removeClass('correct-input').addClass('wrong-input');
        $('#password-confirmation').removeClass('correct-input').addClass('wrong-input');
        return false;
    }
}