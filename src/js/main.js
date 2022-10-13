// Switcher
const switcher = document.getElementsByClassName('switcher')[0];
const plansPrice = document.querySelectorAll('.plans__item-price span');
const monthPrice = [19, 54, 89];
const yearPrice = [12, 36, 56];

switcher.addEventListener('click', function () {
    switcher.classList.toggle('active-1');
    switcher.classList.toggle('active-2');

    if (switcher.classList.contains('active-2')) {
        plansPrice.forEach((el, i) => {
            el.parentElement.classList.add('hide');

            setTimeout(() => {
                el.innerHTML = `$${yearPrice[i]}`;
                el.parentElement.classList.remove('hide')
            }, 500)
        })
    } else {
        plansPrice.forEach((el, i) => {
            el.parentElement.classList.add('hide');

            setTimeout(() => {
                el.innerHTML = `$${monthPrice[i]}`;
                el.parentElement.classList.remove('hide')
            }, 500)
        })
    }
})