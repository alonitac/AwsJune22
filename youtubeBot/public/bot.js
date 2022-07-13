var botui = new BotUI('my-botui-app');


function enterText() {
    botui.action.text({
        action: {
            placeholder: 'Enter your text'
        }
    }).then(function (res) {

        console.log(res);

        $.ajax({
            contentType: 'application/json',
            data: JSON.stringify({text: res.value}),
            dataType: 'json',
            success: function(data){
                botui.message.add({
                    content: data.text
                });

                if (data.videoId) {
                    botui.message.add({
                        type: 'embed',
                        content: 'https://www.youtube.com/embed/' + data.videoId
                    });
                }

                enterText();
            },
            type: 'POST',
            url: '/youtube'
        });
    });

}

enterText();
