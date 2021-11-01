const Discord = require('discord.js');

const self = module.exports = {
    getErrorEmbed: (desc) => {
        return new Discord.MessageEmbed()
            .setColor('#E85959')
            .setTitle('Error!')
            .setDescription(desc);
    },
    getResultEmbed: (desc) => {
        return new Discord.MessageEmbed()
        .setColor('#F6FD85')
        .setTitle(desc)
    },
    getSuccessEmbed: (desc) => {
        return new Discord.MessageEmbed()
        .setColor('##71E465')
        .setTitle('Success.')
        .setDescription(desc)
    }
}