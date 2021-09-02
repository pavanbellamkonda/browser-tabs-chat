import { Injectable } from '@angular/core';
import type { IDBPDatabase } from 'idb';
import { openDB } from 'idb';
import { Subject } from 'rxjs';

@Injectable()
export class AppService {

  username: string;
  db!: IDBPDatabase;
  chatsStoreName = 'chats';
  usersStoreName = 'users';
  chatMessagesStoreName = 'chatMessages';
  chatsMap = new Map();
  stores: { name: string, options?: IDBObjectStoreParameters }[]  = [
    {
      name: this.usersStoreName,
      options: {
        keyPath: 'username'
      }
    },
    {
      name: this.chatsStoreName,
      options: {
        keyPath: 'chatId'
      }
    },
    {
      name: this.chatMessagesStoreName,
      options: {
        autoIncrement: true
      }
    }
  ];

  userToChat = new Subject<{username: string, online: boolean, setActive?:boolean}>();
  chatClicked = new Subject<{username: string, online: boolean}>();

  onlineUsersChannel = new BroadcastChannel('online-users');
  chatMessagesChannel = new BroadcastChannel('chat-messages');

  constructor() {
    this.username = '';
    openDB('chatDB', 1, {
      upgrade: db => {
        this.db = db;
        this.createObjectStoresIfNotExist();
      }
    }).then(db => {
      this.db = db;
      this.createObjectStoresIfNotExist();
    });
    window.onbeforeunload = () => {
      if(this.username.length > 0) {
        this.onlineUsersChannel.postMessage({
          online: false,
          username: this.username
        })

        const usersStore = this.db.transaction(this.usersStoreName, 'readwrite').objectStore(this.usersStoreName);
        usersStore.put({
          online: true,
          username: this.username
        });
      }
    }
  }

  private createObjectStoresIfNotExist() {
    this.stores.forEach(store => {
      if (!this.db.objectStoreNames.contains(store.name)) {
        const objectStore = this.db.createObjectStore(store.name, store.options);
        if (store.name === this.chatsStoreName) {
          objectStore.createIndex('participantsIndex', 'participants', {
            multiEntry: true
          });
        }
        if (store.name === this.chatMessagesStoreName) {
          objectStore.createIndex('chatIdIndex', 'chatId');
        }
      }
    });
  }

  async logInUser(username: string) {
    this.username = username;
    const usersStore = this.db.transaction(this.usersStoreName, 'readwrite').objectStore(this.usersStoreName);
    if (!(await usersStore.get(username))) {
      await usersStore.add({
        username,
        online: true
      });
    } else {
      await usersStore.put({
        online: true,
        username
      });
    }
    this.onlineUsersChannel.postMessage({
      online: true,
      username
    })
  }

  async getAllUsers() {
    const usersStore = this.db.transaction(this.usersStoreName, 'readonly').objectStore(this.usersStoreName);
    const allUsers = await usersStore.getAll();
    return allUsers.filter((user) => user.username !== this.username);
  }

  openchat(user: { username: string, online: boolean, setActive?: boolean }) {
    user.setActive = 'setActive' in user ? user.setActive : true;
    this.userToChat.next(user);
  }

  async sendChat(chatter: any, text: string) {
    const {chatId, participants} = this.createChatId(chatter);
    if (!this.chatsMap.has(chatId)) {
      const chatsStore = this.db.transaction(this.chatsStoreName, 'readwrite').objectStore(this.chatsStoreName);
      if (!(await chatsStore.get(chatId))) {
        await chatsStore.add({
          participants,
          chatId
        });
      }
      this.chatsMap.set(chatId, participants);
    }
    const chatMessagesStore = this.db.transaction(this.chatMessagesStoreName, 'readwrite').objectStore(this.chatMessagesStoreName);
    const chatRecord = {
      sender: this.username,
      receiver: chatter.username,
      text,
      chatId,
      timestamp: new Date()
    };
    await chatMessagesStore.add(chatRecord);
    return chatRecord;
  }

  createChatChannel(chatter: any) {
    return new BroadcastChannel(this.createChatId(chatter).chatId);
  }

  createChatId(chatter: any) {
    const participants = [chatter.username, this.username].sort();
    const chatId = participants.join('$');
    return {chatId, participants};
  }

  async getChatMessages(chatter: any) {
    const {chatId} = this.createChatId(chatter);
    const chatMessagesStore = this.db.transaction(this.chatMessagesStoreName, 'readonly').objectStore(this.chatMessagesStoreName);
    const chatIdIndex = chatMessagesStore.index('chatIdIndex');
    const chatMessages = await chatIdIndex.getAll(chatId);
    return chatMessages.map(message => {
      if (message.sender === this.username) {
        message.fromSelf = true;
      }
      return message;
    });
  }

  async getUserChats() {
    const chatsStore = this.db.transaction(this.chatsStoreName, 'readonly').objectStore(this.chatsStoreName);
    const participantsIndex = chatsStore.index('participantsIndex');
    const chats = await participantsIndex.getAll(this.username);
    return chats.map(chat => {
      return {
        chatter: chat.participants.find((p: string) => p!== this.username)
      };
    });
  }
}
