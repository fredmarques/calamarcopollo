import moment from 'moment';

const dayString = (d, dayStrings) => {
    const day = moment(d);
    const today = moment();
    const isToday = day.isBetween(
        today.clone().startOf('day'),
        today.clone().endOf('day')
    );
    const diff = day.diff(today, 'days');
    if (isToday) {
        return dayStrings.today;
    }
    if (diff === 0) {
        return dayStrings.tomorrow;
    }
    if (diff === 1) {
        return dayStrings.dayAfterTomorrow;
    }
    return day.format('LL');
};

export { dayString };