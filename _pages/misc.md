---
permalink: /misc/
title: "Misc"
author_profile: true
redirect_from: 
  - /misc.html
---

Apart from my research, I am also interested in Economics and Ancient Philosophy. I believe that interdisciplinary integration is crucial. My favorite philosophers are <a href="https://en.wikipedia.org/wiki/Immanuel_Kant" class='avatar' id='kant'>Kant</a> and <a href="https://en.wikipedia.org/wiki/Ludwig_Wittgenstein" class='avatar' id='wittgenstein'>Wittgenstein</a>.

<hr>

I'm a devoted fan of indie games, and one of my dreams is to create a game of my own. I like <i><a href="https://store.steampowered.com/app/646570" class='avatar' id='slay'>Slay the Spire</a></i> and <i><a href="https://store.steampowered.com/app/881100" class='avatar' id='noita'>Noita</a></i> very much. 

:star2: <b><i><a href="https://store.steampowered.com/app/2358720" class='avatar' id='wukong'>Black Myth: Wukong</a></i> is the first Triple-A game made in China. I invite you to participate and witness the development of Chinese game industry.</b>


:blush: :speech_balloon: <b>I’d love to hear from you if you have interesting topics to share!</b>


<style>
    div .flip-card-inner{
        display: grid;
    }

    .flip-card-inner #overlap {
            transform: rotateY(180deg);
            display: block;
    }

    .flip-card-inner img{
        grid-column: 1;
        grid-row: 1;
        object-fit: scale-down;
        max-width: 175px;
        max-height: 175px;

        -webkit-backface-visibility: hidden; /* Safari */
        backface-visibility: hidden;
        transition: transform 0.8s;
        transform-style: preserve-3d;
    }
    
</style>

<script type="text/javascript">
    window.onload = function () {
        img1 = document.querySelector('.flip-card-inner #overlap');
        img2 = document.querySelector('.flip-card-inner img');
        avatars = document.querySelectorAll('.avatar');
        
        avatars.forEach(function(ele) {
            ele.addEventListener('mouseover', function() {
                img1.style.transform='rotateY(0deg)';
                img2.style.transform='rotateY(180deg)';
                var obj = event.target || window.event.srcElement;
                img1.src="/images/misc/"+obj.id+".png";
                
            });
            ele.addEventListener('mouseout', function() {
                img1.style.transform='rotateY(180deg)';
                img2.style.transform='rotateY(0deg)';
            });
        });
    }
</script>
