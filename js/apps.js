// Define files in CLI filesystem. 
var validAppDirectories = {
    "/": "SYSTEM\nHOME",
    SYSTEM: "..\nmenu\ncli",
    HOME: "..\nresume\nprofile",
    
};
$('.apps').height();
$('.apps').width();

(function addIcons(i) {
    setTimeout(function () {
        let newApp = $('<img />', {
            id: 'appId' + i,
            src: '/images/placeholder.png',
            alt: i,
            style: "border-radius: 1px;border: 2px solid #73AD21; padding: 2vw; width: 10vw; height: 10vw; ",
            class: "appElm",
            ondragstart: "return false;"
        });
        $('.apps').append(newApp);              
        if (--i) {
            addIcons(i);  
        }
    }, 20)
})(10);

$('.apps').on('click', ".appElm", function () {
    let appID = $(this).attr('id');
    // eslint-disable-next-line no-undef
    Swal.fire({
        title: 'You\'re too early!',
        text: 'This app (' + appID + ') is not available yet. Meanwhile, try launching an app from the left sidebar instead!',
        imageUrl: 'https://httpstatusdogs.com/img/404.jpg',
        confirmButtonText: 'Awesome!',
        backdrop: `rgba(0,0,123,0.4)`,
        showClass: {
            popup: '',                     // disable popup animation
        },
    })
});

