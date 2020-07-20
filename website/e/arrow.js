
$(function () {
    $(".arrow-up").hide();
    let TIMER = null;
    let staticHeight = $(window).height() / 2 + $(window).height() / 3;
    $(window).on("scroll", function () {
        let init = $(window).scrollTop();
        let height = $(window).height();
        if (init >= height) {
            $(".arrow-up").show();
        } else {
            $(".arrow-up").hide();
        }
        entrance()
    });
    $(".arrow-up").click(function () {
        let init = $(window).scrollTop();

        function animate() {
            init -= 180;
            window.scrollTo(0, init);
            if (init <= 0) {
                clearInterval(TIMER);
            } else {
                TIMER = requestAnimationFrame(animate);
            }
        }
        TIMER = requestAnimationFrame(animate);
    });

    // 数组加
    function increment() {
        let val = $('.increment')
        let wh = parseInt(val.eq(0).html())
        let jd = parseInt(val.eq(1).html())
        let dr = parseInt(val.eq(2).html())
        let bfl = parseInt(val.eq(3).html())
        val.each(function () {
            $(this).html(' ')
        })
        let n1 = wh - 50
        let n2 = jd - 1
        let n3 = dr - 5
        let n4 = bfl - 1
        let t1 = setInterval(function () {
            n1 += 1
            if (n1 === wh) {
                clearInterval(t1)
            }
            val.eq(0).html(n1 + '+')
        }, 60)
        let t2 = setInterval(function () {
            n2 += 1
            if (n2 === jd) {
                clearInterval(t2)
            }
            val.eq(1).html(n2 + '')
        }, 60)
        let t3 = setInterval(function () {
            n3 += 1
            if (n3 === dr) {
                clearInterval(t3)
            }
            val.eq(2).html(n3 + 'M+')
        }, 60)
        let t4 = setInterval(function () {
            n4 += 1
            if (n4 === bfl) {
                clearInterval(t4)
            }
            val.eq(3).html(n4 + 'M+')
        }, 200)
    }

    increment()

    // 入场动画
    function entrance() {
        let entrances = $(".entrances");
        let leftIn = $(".leftIn")
        let rightIn = $(".rightIn")
        let rotateLeft = $('.rotateLeft')
        let rotateRight = $('.rotateRight')
        let zoomin = $('.zoomin')
        let fadeInDown = $('.fadeDown')
        let filpin = $('.filpin')
        let filpiny = $('.filpiny')
        entrances.each(function () {
            let windowTop = $(window).scrollTop();
            let elemetTop = $(this).offset().top;
            if (windowTop + staticHeight > elemetTop) {
                $(this).addClass("slideInUp animated");
            }
        });
        // 滑动进入
        leftIn.each(function () {
            let windowTop = $(window).scrollTop();
            let elemetTop = $(this).offset().top;
            if (windowTop + staticHeight > elemetTop) {
                $(this).addClass("fadeInLeft animated");
            }
        })
        rightIn.each(function () {
            let windowTop = $(window).scrollTop();
            let elemetTop = $(this).offset().top;
            if (windowTop + staticHeight > elemetTop) {
                $(this).addClass("fadeInRight animated");
            }
        })
        // 旋转进入
        rotateLeft.each(function () {
            let windowTop = $(window).scrollTop();
            let elemetTop = $(this).offset().top;
            if (windowTop + staticHeight > elemetTop) {
                $(this).addClass("rotateInDownLeft animated");
            }
        })
        rotateRight.each(function () {
            let windowTop = $(window).scrollTop();
            let elemetTop = $(this).offset().top;
            if (windowTop + staticHeight > elemetTop) {
                $(this).addClass("rotateInDownRight animated");
            }
        })
        // 掉下来
        zoomin.each(function () {
            let windowTop = $(window).scrollTop();
            let elemetTop = $(this).offset().top;
            if (windowTop + staticHeight > elemetTop) {
                $(this).addClass("zoomIn animated");
            }
        })
        fadeInDown.each(function () {
            let windowTop = $(window).scrollTop();
            let elemetTop = $(this).offset().top;
            if (windowTop + staticHeight > elemetTop) {
                $(this).addClass("fadeInDown animated");
            }
        })
        // 反转
        filpin.each(function () {
            let windowTop = $(window).scrollTop();
            let elemetTop = $(this).offset().top;
            if (windowTop + staticHeight > elemetTop) {
                $(this).addClass("flipInX animated");
            }
        })
        filpiny.each(function () {
            let windowTop = $(window).scrollTop();
            let elemetTop = $(this).offset().top;
            if (windowTop + staticHeight > elemetTop) {
                $(this).addClass("flipInY animated");
            }
        })
    }

    entrance();

    $('.js-consolut').click(function () {
        $('.js-control-pur').removeClass('js-hide')
    })

    $('.js-control-pur').click(function (e) {
        event.stopPropagation()
        $(this).addClass('js-hide')
    })

    $('.js-control-pru-box').click(function (e) {
        event.stopPropagation()
    })

    if ("undefined" != typeof adv_loop && adv_loop) {
        let bannerSwiper = new Swiper('#banner .swiper-container', {
            loop: true,
            speed: 600,
            parallax: true,
            setWrapperSize: true,
            autoHeight: true,
            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
        })
    }

    if ("undefined" != typeof adv_loop && !adv_loop) {
        //一张图片则隐藏锚节点 
        $(".swiper-pagination-bullets > span").css("display", "none");
    }

    // 导航悬浮
    let prev = 0;
    let bannerHeight = $('.banner').height();
    let navHeight = $('header').height();
    $(window).on('scroll', function () {
        let init = $(window).scrollTop();
        if (bannerHeight < init) {
            $('header').addClass('js-header');
            $('.nav-item').addClass('js-nav-item')
            $('.js-nav-active').css({ background: '#00a1e9' })
            $('.js-nav-active a').css({ color: '#fff' })
            $('.logo img').attr('src', imgBaseUrl + '/logo-res.png')
            $('header').css({
                position: 'fixed',
                transform: `translateY(-${navHeight}px)`,
            })
            if (prev > init) {
                $('header').css({
                    position: 'fixed',
                    transition: 'all 0.3s',
                    transform: 'translateY(0)'
                })
            }
        } else {
            $('header').css({
                position: 'absolute',
                transition: 'all 0s',
            })
            $('.js-nav-active').css({ background: '##dbbe93' })
            $('.js-nav-active a').css({ color: '#000' })
            $('header').removeClass('js-header')
            $('.nav-item').removeClass('js-nav-item')
            $('.logo img').attr('src', imgBaseUrl + '/logo.png')
        }
        prev = init
    })

    // 控制视频播放
    $('.video-wapper').on('click', function () {
        let video = $(this).children('video')[0]
        if (video.paused) {
            $(this).children('.play-btn').hide()
            $(this).children('video').trigger('play')
        } else {
            $(this).children('.play-btn').show()
            $(this).children('video').trigger('pause')
        }
    })
    $('.video-wapper video').bind('pause ended', function () {
        $(this).siblings('div').show()
    })
})