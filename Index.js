const Client = require("./Client")
const ActivityHandler = require("./ActivityHandler")

// ActivityHandler.registerDiscordEvents()
// function testActiveMember() {
//     let instance = new ActivityHandler(Client)
//     instance._onClientMessage({
//         guild: {
//             id: "838746881176633355"
//         },
//         author: {
//             id: "544378114579628054"
//         },

//     }, 1)
//     let activity = instance._isMemberActive({ id: "838746881176633355" }, { id: "544378114579628054" }, 1 + 2000)
//     if (activity) {
//         global.logger("debug", "TEST PASSED!")
//     } else {
//         global.logger('error', "TEST FAILED")
//     }

// }


// function testNotActiveMember() {
//     let instance = new ActivityHandler(Client)
//     instance._onClientMessage({
//         guild: {
//             id: "838746881176633123"
//         },
//         author: {
//             id: "544378114579628123"
//         },

//     }, 1)
//     let activity = instance._isMemberActive({ id: "838746881176633123" }, { id: "544378114579628123" }, 1 + instance.noActivityTimeout + 1)
//     if (activity) {
//         global.logger('error', "TEST FAILED")
//     } else {
//         global.logger("debug", "TEST PASSED!")
//     }

// }

// function testNeverActiveMember() {
//     let instance = new ActivityHandler(Client)
//     instance.mainUptime = 1
//     let activity = instance._isMemberActive({ id: "838746881176633123" }, { id: "544378114579628999" }, 2)
//     if (activity) {
//         global.logger("debug", "TEST PASSED!")
//     } else {
//         global.logger('error', "TEST FAILED")
//     }

// }


// function testNeverActiveMember2() {
//     let instance = new ActivityHandler(Client)
//     instance.mainUptime = 1
//     let activity = instance._isMemberActive({ id: "838746881176633123" }, { id: "544378114579628999" }, instance.noActivityTimeout + 1)
//     if (!activity) {
//         global.logger("debug", "TEST PASSED!")
//     } else {
//         global.logger('error', "TEST FAILED")
//     }

// }

// testActiveMember()
// testNotActiveMember()
// testNeverActiveMember()
// testNeverActiveMember2()




