'use strict'

/* eslint-disable indent */
const Discord = require('discord.js')
  const client = new Discord.Client()
require('dotenv').config()
/* eslint-enable indent */

const activeUserRegistration = new Discord.Collection()
const userRegistrationSteps = [
  ['1. Valorant Username', 'What is your FULL Valorant username?'],
  ['2. Valorant Rank', 'What rank are you in Valorant? If you don\'t have a rank, type "N/A"'],
  ['3. Notifications', 'Do you want to be notified when LFG starts? Respond "yes" or "no".']
]

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}! All systems online.`)
  client.user.setActivity('for matches', { type: 'WATCHING' })
})

client.on('message', message => {
  if (message.author === client.user || message.author.bot === true) return // ignore messages from the bot itself or other bots
  if (activeUserRegistration.has(message.author.id)) {
    handleUserRegistration(activeUserRegistration.get(message.author.id), message)
    return
  }
  if (message.guild.id !== '704495983542796338' && message.guild.id !== '350855731609600000') return // ignore message if not from "Fun Valorant Times"

  if (message.content === '!register') {
    const embed = new RegistrationEmbed({
      name: message.author.username + '#' + message.author.discriminator,
      iconURL: message.author.avatarURL()
    })
    embed.addField('1. Valorant Username', 'What is your FULL Valorant username?')
    message.reply('Let\'s begin your registration process!', embed)
      .then(async registrationMessage => {
        activeUserRegistration.set(message.author.id, {
          step: 0,
          botMessage: registrationMessage,
          userID: message.author.id,
          registrationInformation: {
            discordID: message.author.id
          }
        }) // add user to the list of users who are currently registering, and set their progress to 0 (none)
        await registrationMessage.react('❌')
      })
  }
})

if (process.env.TOKEN) {
  client.login(process.env.TOKEN)
} else {
  console.error('Bot token not found! Ensure environment variable TOKEN contains the bot token.')
}

class RegistrationEmbed {
  constructor (author) {
    const embed = new Discord.MessageEmbed()
      .setTitle('ScrimBot Registration')
      .setAuthor(author.name, author.iconURL)
      .setDescription('Welcome to ScrimBot! We will ask you a set of questions to get started. At any time, you can cancel by reacting with the x below. You can either respond to these questions in the current channel or through DMs with the bot.')
    return embed
  }
}

const handleUserRegistration = (userRecord, userMessage) => {
  if (userMessage.channel.type !== 'dm' && userMessage.channel !== userRecord.botMessage.channel) return
  userRecord.step = userRecord.step + 1
  if (userRecord.step < userRegistrationSteps.length) {
    const embed = userRecord.botMessage.embeds[0]

    const previousField = embed.fields[userRecord.step - 1]
    previousField.name = '✅ ' + previousField.name

    const stepInfo = userRegistrationSteps[userRecord.step]
    embed.addField(stepInfo[0], stepInfo[1])
    userRecord.botMessage.edit(embed)

    activeUserRegistration.set(userRecord.userID, userRecord)
  } else {
    const embed = new Discord.MessageEmbed()
      .setTitle('ScrimBot Registration Complete')
      .setDescription('Thanks for registering! Now it\'s time to get playing!')
    userRecord.botMessage.edit(embed)
    activeUserRegistration.delete(userRecord.userID)
  }
}
