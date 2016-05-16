import { updateChatSession } from '../actionCreators';
import { tripDialogReply } from '../tripDialog';
import { WitDriver } from 'calamars';
const { getEntity, getEntityValue, getEntityMeta } = WitDriver;

const placesConfidenceThreshold = 0.7;

const extractEntities = outcomes => {
    const unknownPlace = getEntity(outcomes, 'places');
    const origin = getEntity(outcomes, 'origin');
    const originMeta = getEntityMeta(origin);
    const destination = getEntity(outcomes, 'destination');
    const destinationMeta = getEntityMeta(destination);
    const dateTime = getEntity(outcomes, 'datetime');
    console.log('dateTime', dateTime);
    const timeFilter = {
        from: !dateTime.from ? dateTime : dateTime.from,
        to: dateTime.to ? dateTime.to : null
    };
    return {
        unknownPlace,
        origin,
        originMeta,
        destination,
        destinationMeta,
        timeFilter
    };
};

const routes = [[
    outcomes => getEntityValue(outcomes, 'trip') === 'info',
    (outcomes, { store, chat }) => {
        const {
            origin,
            originMeta,
            destination,
            destinationMeta,
            timeFilter
        } = extractEntities(outcomes);
        const context = chat.session;
        let nextContext = Object.assign({}, context);
        nextContext.timeFilter = timeFilter;
        console.log('tripInfo intent', context);
        if (destination && destination.confidence >= placesConfidenceThreshold) {
            nextContext.destination = destination.value;
            nextContext.destinationMeta = destinationMeta;
        }
        if (origin && origin.confidence >= placesConfidenceThreshold) {
            nextContext.origin = origin.value;
            nextContext.originMeta = originMeta;
        }
        console.log('nextContext: ', nextContext);
        store.dispatch(updateChatSession({
            chat: { ...chat, session: nextContext }
        }));
        return tripDialogReply(nextContext);
    }
], [
    outcomes => (getEntityValue(outcomes, 'trip') !== 'info' && (
        getEntityValue(outcomes, 'places') ||
        getEntityValue(outcomes, 'origin') ||
        getEntityValue(outcomes, 'destination'
    ))),
    (outcomes, { store, chat }) => {
        const context = chat.session;
        const {
            unknownPlace,
            origin,
            destination,
            timeFilter
        } = extractEntities(outcomes);
        const place = unknownPlace || origin || destination;
        const placeMeta = getEntityMeta(place);
        let nextContext = Object.assign({}, context);
        nextContext.timeFilter = timeFilter;
        if (nextContext.destination && !nextContext.origin) {
            nextContext.origin = place.value;
            nextContext.originMeta = placeMeta;
        } else if (
            (!nextContext.destination && nextContext.origin) ||
            (!nextContext.destination && !nextContext.origin)
        ) {
            nextContext.destination = place.value;
            if (placeMeta) {
                nextContext.destinationMeta = placeMeta;
            }
        }
        console.log('nextContext: ', nextContext);
        store.dispatch(updateChatSession({
            chat: { ...chat, session: nextContext }
        }));
        return tripDialogReply(nextContext);
    }
]];
export default routes;
