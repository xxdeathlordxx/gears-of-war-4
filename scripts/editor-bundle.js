define("editor",["require","exports","./savepoint","libvantage","aurelia-templating-resources","./save","./gearpc","./gearpc","./weapons","./player-models"],function(e,t,a,r,n,o,i,s,l,u){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var c={};l.default.forEach(function(e){return c[e.model]=e});var m="/Game/Maps/SP/GearCampaign_P.GearCampaign_P.PersistentLevel.GearPC_SP_0",p="/Game/Maps/SP/GearCampaign_P.GearCampaign_P.PersistentLevel.GearAIController_COG_C",d="/Game/Maps/SP/GearCampaign_P.GearCampaign_P.PersistentLevel.",_=function(){function e(e){this.availablePlayerModels=u.default,this.weaponModels=c,this.availableWeapons=l.default.map(function(e){return{label:e.name,value:e.model}}),this.signaler=e}return e.inject=function(){return[n.BindingSignaler]},e.prototype.signalAIList=function(){this.signaler.signal("ai-signal")},e.prototype.load=function(e){var t=this;this.savedGame=new o.GearSave(new r.Stream(e));var n=this.savedGame.root.SavepointBinaryBlob.buffer;if(!this.savedGame.root.ChecksumKey)throw new Error("Checksum not found.");if(r.crc32(n)!==this.savedGame.root.ChecksumKey.value)throw new Error("Invalid checksum.");this.savePoint=new a.SavepointBinaryBlob(n);var l=this.savePoint.getObjectStruct(m);if(!l)throw new Error("Player not found in save.");this.aiControllerMap=[];var u=this.savePoint.getObjectStructs(p,!0);this.squadType=0;for(var c in u){if(!u[c])throw new Error("Invalid AI Controller entry.");0===this.squadType&&(this.squadType=u[c].objectType),this.aiControllerMap[c]=new s.GearController(u[c].data)}this.player=new i.GearPC(l.data),this.playerModel=this.player.type,this.weapons=[];for(var d=0;d<6;d++)this.weapons.push({model:null,ammo:void 0});this.player.weapons.forEach(function(e){if(!(e.slot>=t.weapons.length)){var a=t.savePoint.getObjectName(e.objectName),r=t.getWeaponFromModel(a);t.weapons[e.slot]={model:a,ammo:r?e.spareAmmoCount+(r.clipSize-e.ammoUsedCount):e.spareAmmoCount}}})},e.prototype.getWeaponFromModel=function(e){return l.default.find(function(t){return t.model===e})},e.prototype.maxAmmo=function(){this.weapons.forEach(function(e){e.model&&(e.ammo=1e8)})},e.prototype.maxAIAmmo=function(){this.aiWeapons.forEach(function(e){e.model&&(e.ammo=1e8)})},e.prototype.maxAllAIAmmo=function(){for(var e in this.aiControllerMap){this.aiControllerMap[e].weapons.forEach(function(e){e.ammoUsedCount=0,e.spareAmmoCount=1e8})}this.maxAIAmmo()},e.prototype.editAIProperties=function(e){this.modAIWeapons(e),this.modPawnPosition(e)},e.prototype.modAIWeapons=function(e){var t=this;this.lastAIController&&this.saveWeapons(this.lastAIController,this.aiWeapons),this.aiWeapons=[];for(var a=0;a<6;a++)this.aiWeapons.push({model:null,ammo:0});this.lastAIController=e,e.weapons.forEach(function(e){if(!(e.slot>=t.aiWeapons.length)){var a=t.savePoint.getObjectName(e.objectName),r=t.getWeaponFromModel(a);t.aiWeapons[e.slot]={model:a,ammo:r?e.spareAmmoCount+(r.clipSize-e.ammoUsedCount):e.spareAmmoCount}}})},e.prototype.modPawnPosition=function(e){this.aiCoordinates=e.coordinates},e.prototype.getDistanceFromCoords=function(e,t){return Math.sqrt(Math.pow(t.X-e.X,2)+Math.pow(t.Y-e.Y,2))},e.prototype.getFreePosition=function(e){var t=s.CoordinateData.copyFrom(e),a=s.CoordinateData.copyFrom(e);for(this.getDistanceFromCoords(t,a);this.getDistanceFromCoords(t,a)<20;)for(var r in this.aiControllerMap)a=this.aiControllerMap[r].coordinates,this.getDistanceFromCoords(t,a)<20&&(t.X+=20,t.Y+=20);return t.Z+=100,t},e.prototype.getInstanceId=function(e){var t=e.lastIndexOf("_");if(-1!==t){var a=e.substr(t+1);if(0!==a.length&&("0"===a||a.match(/^[1-9][0-9]*$/)))return parseInt(a)+1}return 0},e.prototype.cloneAI=function(e){var t=p+"_"+Object.keys(this.aiControllerMap).length,a=!1;if(this.savePoint.hasObjectName(t))for(var r=0;r<100;r++){if(t=p+"_"+r,this.savePoint.isStructReplaceable(t)){a=!0;break}if(!this.savePoint.hasObjectName(t))break}var n=this.savePoint.getSimpleObjectIndex(t,"/Game/Gameplay/AI/Controller/GearAIController_COG.GearAIController_COG_C"),o=e.toBuffer();a?this.savePoint.setObjectStructAndType(t,this.squadType,o):this.savePoint.addObjectStruct(n,this.squadType,o);var i=new s.GearController(o);i.coordinates=this.getFreePosition(e.coordinates),this.aiControllerMap[t]=i,this.signalAIList()},e.prototype.deleteAI=function(e){var t="";for(var a in this.aiControllerMap)if(this.aiControllerMap[a]===e){t=a;break}if(""===t)throw new Error("Attempting to delete an AI Controller entry.");delete this.aiControllerMap[t],this.savePoint.deleteObjectStruct(t),this.signalAIList()},e.prototype.saveWeapons=function(e,t){var a=this;e.weapons=t.filter(function(e){return!!e.model}).map(function(e,t){var r=a.getWeaponFromModel(e.model);return{objectName:a.savePoint.getObjectIndex(e.model,"/Script/Engine.BlueprintGeneratedClass",!0),slot:t,ammoUsedCount:0,spareAmmoCount:r?e.ammo-r.clipSize:e.ammo,extraWeapon:0}})},e.prototype.save=function(){var e=this;this.savePoint.getObjectIndex(d+this.playerModel.split(".")[1],this.playerModel,!1),this.player.type=this.playerModel,this.player.weapons=this.weapons.filter(function(e){return!!e.model}).map(function(t,a){var r=e.getWeaponFromModel(t.model);return{objectName:e.savePoint.getObjectIndex(t.model,"/Script/Engine.BlueprintGeneratedClass",!0),slot:a,ammoUsedCount:0,spareAmmoCount:t.ammo-r.clipSize,extraWeapon:4==a?1:0}}),this.savePoint.setObjectStruct(m,this.player.toBuffer()),this.lastAIController&&this.saveWeapons(this.lastAIController,this.aiWeapons);for(var t in this.aiControllerMap)this.savePoint.getObjectIndex(d+this.aiControllerMap[t].type.split(".")[1],this.aiControllerMap[t].type,!1),this.savePoint.setObjectStruct(t,this.aiControllerMap[t].toBuffer());var a=this.savePoint.toBuffer();return this.savedGame.root.SavepointBinaryBlob.buffer=a,this.savedGame.root.ChecksumKey.value=r.crc32(a),this.savedGame.toBuffer()},e}();t.Editor=_;var h=function(){function e(){}return e.prototype.toView=function(e){var t=[];for(var a in e)e.hasOwnProperty(a)&&t.push(e[a]);return t},e}();t.ObjectKeysValueConverter=h}),define("environment",["require","exports"],function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default={debug:!1,testing:!1}}),define("gearpc",["require","exports","./util","libvantage"],function(e,t,a,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var n=function(){function e(e){if(e){var t=new r.Stream(e);this.X=t.readFloat(),this.Y=t.readFloat(),this.Z=t.readFloat()}else this.X=0,this.Y=0,this.Z=0}return e.copyFrom=function(t){var a=new e;return a.X=t.X,a.Y=t.Y,a.Z=t.Z,a},e.prototype.toBuffer=function(){var e=r.Stream.reserve(12);return e.writeFloat(this.X),e.writeFloat(this.Y),e.writeFloat(this.Z),e.getBuffer()},e.prototype.isEqual=function(e){return e.X==this.X&&e.Y==this.Y&&e.Z==this.Z},e}();t.CoordinateData=n;var o=function(){function e(e){var t=this,o=new r.Stream(e);this.unknownZeroes=o.readBytes(16),this.floatOne=o.readFloat(),this.type=a.readString(o),this.locationData1=o.readBytes(8),this.coordinates=new n(o.readBytes(12)),this.locationData2=o.readBytes(12),this.mesh=a.readString(o),this.unknownBytes1=o.readBytes(5),this.squadName=o.readUInt32(),this.unknownBytes2=o.readBytes(12),this.weapons=o.loopUInt32(function(){return t.readWeapon(o)}),this.restOfData=o.readToEnd()}return e.prototype.readWeapon=function(e){return{objectName:e.readUInt32(),slot:e.readByte(),ammoUsedCount:e.readInt32(),spareAmmoCount:e.readUInt32(),extraWeapon:e.readInt32()}},e.prototype.toBuffer=function(){var e=r.Stream.reserve(1024);return e.writeBytes(this.unknownZeroes),e.writeFloat(this.floatOne),a.writeString(e,this.type),e.writeBytes(this.locationData1),e.writeBytes(this.coordinates.toBuffer()),e.writeBytes(this.locationData2),a.writeString(e,this.mesh),e.writeBytes(this.unknownBytes1),e.writeUInt32(this.squadName),e.writeBytes(this.unknownBytes2),e.writeUInt32(this.weapons.length),this.weapons.forEach(function(t){e.writeUInt32(t.objectName),e.writeByte(t.slot),e.writeInt32(t.ammoUsedCount),e.writeUInt32(t.spareAmmoCount),e.writeInt32(t.extraWeapon)}),e.writeBytes(this.restOfData),e.getBuffer()},e}();t.GearPC=o;var i=function(){function e(e){var t=this,o=new r.Stream(e);this.unknownZeroes=o.readBytes(16),this.floatOne=o.readFloat(),this.type=a.readString(o),this.locationData1=o.readBytes(8),this.coordinates=new n(o.readBytes(12)),this.locationData2=o.readBytes(12),this.mesh=a.readString(o),this.unknownBytes1=o.readBytes(1),this.squadName=o.readUInt32(),this.unknownBytes2=o.readBytes(6),this.script=a.readString(o),this.unknownBytes3=o.readBytes(4),this.weapons=o.loopUInt32(function(){return t.readWeapon(o)}),this.restOfData=o.readToEnd()}return e.prototype.readWeapon=function(e){return{objectName:e.readUInt32(),slot:e.readByte(),ammoUsedCount:e.readInt32(),spareAmmoCount:e.readUInt32(),extraWeapon:e.readInt32()}},e.prototype.toBuffer=function(){var e=r.Stream.reserve(1024);return e.writeBytes(this.unknownZeroes),e.writeFloat(this.floatOne),a.writeString(e,this.type),e.writeBytes(this.locationData1),e.writeBytes(this.coordinates.toBuffer()),e.writeBytes(this.locationData2),a.writeString(e,this.mesh),e.writeBytes(this.unknownBytes1),e.writeUInt32(this.squadName),e.writeBytes(this.unknownBytes2),a.writeString(e,this.script),e.writeBytes(this.unknownBytes3),e.writeUInt32(this.weapons.length),this.weapons.forEach(function(t){e.writeUInt32(t.objectName),e.writeByte(t.slot),e.writeInt32(t.ammoUsedCount),e.writeUInt32(t.spareAmmoCount),e.writeInt32(t.extraWeapon)}),e.writeBytes(this.restOfData),e.getBuffer()},e}();t.GearController=i}),define("main",["require","exports","tslib","libvantage"],function(e,t,a,r){"use strict";function n(e){return a.__awaiter(this,void 0,void 0,function(){return a.__generator(this,function(t){switch(t.label){case 0:return e.use.basicConfiguration().plugin("libvantage"),[4,e.start()];case 1:return t.sent(),[4,e.setRoot("editor")];case 2:return t.sent(),r.setEditor(e.root.viewModel),[2]}})})}Object.defineProperty(t,"__esModule",{value:!0}),t.configure=n}),define("player-models",["require","exports"],function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=[{label:"Anvil Male 1",value:"/Game/Gameplay/Characters/BP_GearPawn_PRO_Anvil_Male1.BP_GearPawn_PRO_Anvil_Male1_C"},{label:"Anvil Male 2",value:"/Game/Gameplay/Characters/BP_GearPawn_PRO_Anvil_Male2.BP_GearPawn_PRO_Anvil_Male2_C"},{label:"Female 1",value:"/Game/Gameplay/Characters/BP_GearPawn_PRO_Anvil_Female1.BP_GearPawn_PRO_Anvil_Female1_C"},{label:"JD (Outsider)",value:"/Game/Gameplay/Characters/BP_GearPawn_Hero_JD_Outsider.BP_GearPawn_Hero_JD_Outsider_C"},{label:"Del (Outsider)",value:"/Game/Gameplay/Characters/BP_GearPawn_Hero_Del_Outsider.BP_GearPawn_Hero_Del_Outsider_C"},{label:"Kait (Outsider)",value:"/Game/Gameplay/Characters/BP_GearPawn_Hero_Kait_Outsider.BP_GearPawn_Hero_Kait_Outsider_C"},{label:"Oscar (Outsider)",value:"/Game/Gameplay/Characters/BP_GearPawn_Hero_Oscar_Outsider.BP_GearPawn_Hero_Oscar_Outsider_C"},{label:"Marcus (Armored)",value:"/Game/Gameplay/Characters/BP_GearPawn_Hero_Marcus_Armored.BP_GearPawn_Hero_Marcus_Armored_C"},{label:"JD (Armored)",value:"/Game/Gameplay/Characters/BP_GearPawn_Hero_JD_Armored.BP_GearPawn_Hero_JD_Armored_C"},{label:"Del (Armored)",value:"/Game/Gameplay/Characters/BP_GearPawn_Hero_Del_Armored.BP_GearPawn_Hero_Del_Armored_C"},{label:"Kait (Armored)",value:"/Game/Gameplay/Characters/BP_GearPawn_Hero_Kait_Armored.BP_GearPawn_Hero_Kait_Armored_C"},{label:"Dom",value:"/Game/Gameplay/Characters/BP_GearPawn_PRO_Aspho_Dom.BP_GearPawn_PRO_Aspho_Dom_C"},{label:"Aspho Male 1",value:"/Game/Gameplay/Characters/BP_GearPawn_PRO_Aspho_Male1.BP_GearPawn_PRO_Aspho_Male1_C"},{label:"Aspho Male 2",value:"/Game/Gameplay/Characters/BP_GearPawn_PRO_Aspho_Male2.BP_GearPawn_PRO_Aspho_Male2_C"},{label:"Aspho Female 1",value:"/Game/Gameplay/Characters/BP_GearPawn_PRO_Aspho_Female1.BP_GearPawn_PRO_Aspho_Female1_C"},{label:"Aspho Hoffman",value:"/Game/Gameplay/Characters/BP_GearPawn_PRO_Aspho_Hoffman.BP_GearPawn_PRO_Aspho_Hoffman_C"},{label:"Aspho Male 3",value:"/Game/Gameplay/Characters/BP_GearPawn_PRO_Aspho_Male3.BP_GearPawn_PRO_Aspho_Male3_C"},{label:"HOS Female 1",value:"/Game/Gameplay/Characters/BP_GearPawn_PRO_HOS_Female1.BP_GearPawn_PRO_HOS_Female1_C"},{label:"HOS Male 1",value:"/Game/Gameplay/Characters/BP_GearPawn_PRO_HOS_Male1.BP_GearPawn_PRO_HOS_Male1_C"},{label:"Minh",value:"/Game/Gameplay/Characters/BP_GearPawn_COG_Minh.BP_GearPawn_COG_Minh_C"},{label:"HOS Male 2",value:"/Game/Gameplay/Characters/BP_GearPawn_PRO_HOS_Male2.BP_GearPawn_PRO_HOS_Male2_C"},{label:"Anvil Female 1",value:"/Game/Gameplay/Characters/BP_GearPawn_PRO_Anvil_Female1.BP_GearPawn_PRO_Anvil_Female1_C"},{label:"Anvil Male 2",value:"/Game/Gameplay/Characters/BP_GearPawn_PRO_Anvil_Male2.BP_GearPawn_PRO_Anvil_Male2_C"},{label:"Anvil Hoffman",value:"/Game/Gameplay/Characters/BP_GearPawn_PRO_Anvil_Hoffman.BP_GearPawn_PRO_Anvil_Hoffman_C"},{label:"Marcus (Farmer)",value:"/Game/Gameplay/Characters/BP_GearPawn_Hero_Marcus_Farmer.BP_GearPawn_Hero_Marcus_Farmer_C"},{label:"DeeBee PeaceMaker",value:"/Game/Gameplay/Characters/BP_GearPawn_DB_Shepherd_PeaceMaker.BP_GearPawn_DB_Shepherd_PeaceMaker_C"},{label:"DeeBee PeaceKeeper",value:"/Game/Gameplay/Characters/BP_GearPawn_DB_Shepherd_PeaceKeeper.BP_GearPawn_DB_Shepherd_PeaceKeeper_C"},{label:"Locust Swarm (Juvie)",value:"/Game/Gameplay/Characters/BP_GearPawn_Swarm_Juvie.BP_GearPawn_Swarm_Juvie_C"},{label:"Locust Swarm Drone (Imago)",value:"/Game/Gameplay/Characters/BP_GearPawn_Swarm_Drone_Imago.BP_GearPawn_Swarm_Drone_Imago_C"},{label:"Locust Swarm Drone (Grenadier)",value:"/Game/Gameplay/Characters/BP_GearPawn_Swarm_Drone_Grenadier.BP_GearPawn_Swarm_Drone_Grenadier_C"},{label:"Locust Swarm (Pouncer)",value:"/Game/Gameplay/Characters/BP_GearPawn_Swarm_Pouncer.BP_GearPawn_Swarm_Pouncer_C"},{label:"Locust Swarm (Rifle)",value:"/Game/Gameplay/Characters/BP_GearPawn_Swarm_Drone_Rifle.BP_GearPawn_Swarm_Drone_Rifle_C"},{label:"Locust Swarm (Sniper)",value:"/Game/Gameplay/Characters/BP_GearPawn_Swarm_Drone_Sniper.BP_GearPawn_Swarm_Drone_Sniper_C"},{label:"Locust Swarm (Scion)",value:"/Game/Gameplay/Characters/BP_GearPawn_Swarm_Scion_Mulcher.BP_GearPawn_Swarm_Scion_Mulcher_C"},{label:"Locust Swarm (Dropshot)",value:"/Game/Gameplay/Characters/BP_GearPawn_Swarm_Scion_Dropshot.BP_GearPawn_Swarm_Scion_Dropshot_C"},{label:"Locust Snatcher",value:"/Game/Gameplay/Characters/BP_GearPawn_Swarm_Snatcher.BP_GearPawn_Swarm_Snatcher_C"},{label:"Locust Swarm (Elite)",value:"/Game/Gameplay/Characters/BP_GearPawn_Swarm_Drone_Elite.BP_GearPawn_Swarm_Drone_Elite_C"},{label:"Locust Swarm (Carrier)",value:"/Game/Gameplay/Characters/BP_GearPawn_Swarm_Carrier.BP_GearPawn_Swarm_Carrier_C"},{label:"JD (MegaTech)",value:"/Game/Gameplay/Characters/BP_GearPawn_MegaMech_Driver_JD.BP_GearPawn_MegaMech_Driver_JD_C"},{label:"Kait (MegaTech)",value:"/Game/Gameplay/Characters/BP_GearPawn_MegaMech_Driver_Kait.BP_GearPawn_MegaMech_Driver_Kait_C"}]}),define("save",["require","exports","tslib","./util","libvantage"],function(e,t,a,r,n){"use strict";function o(e,a){for(;!e.eof;){var n=r.readString(e),o=r.readString(e);if(0===o.length){a[n]=null;break}a[n]=new t.structs[o](e)}}function i(e,t){for(var a=0,n=Object.getOwnPropertyNames(t);a<n.length;a++){var o=n[a];r.writeString(e,o),null===t[o]?e.writeUInt32(0):(r.writeString(e,t[o].getType()),t[o].write(e))}}Object.defineProperty(t,"__esModule",{value:!0});var s=1396790855,l=function(){function e(e){if(e.readUInt32()!==s)throw new Error("Invalid magic.");this.header=e.readBytes(18);var t={};o(e,t),this.releaseName=Object.getOwnPropertyNames(t)[0],this.root=t[this.releaseName]}return e.prototype.toBuffer=function(){var e=n.Stream.reserve(512e3);return e.writeUInt32(s),e.writeBytes(this.header),i(e,(t={},t[this.releaseName]=this.root,t)),e.getBuffer();var t},e}();t.GearSave=l;var u=function(){function e(e){if(e.position+=8,this.elementType=r.readString(e),"ByteProperty"!==this.elementType)throw new Error("Unsupported for now.");this.buffer=e.readBytes(e.readUInt32())}return e.prototype.write=function(e){e.writeUInt32(this.buffer.length+4),e.writeUInt32(0),r.writeString(e,this.elementType),e.writeUInt32(this.buffer.length),e.writeBytes(this.buffer)},e.prototype.getType=function(){return"ArrayProperty"},e}();t.ArrayProperty=u;var c=function(){function e(e){e.position+=8,this.value=e.readInt32()}return e.prototype.write=function(e){e.writeUInt32(4),e.writeUInt32(0),e.writeInt32(this.value)},e.prototype.getType=function(){return"Int32Property"},e}();t.Int32Property=c;var m=function(e){function t(t){return e.call(this,t)||this}return a.__extends(t,e),t.prototype.getType=function(){return"IntProperty"},t}(c);t.IntProperty=m;var p=function(){function e(e){e.position+=8,this.value=e.readUInt32()}return e.prototype.write=function(e){e.writeUInt32(4),e.writeUInt32(0),e.writeUInt32(this.value)},e.prototype.getType=function(){return"UInt32Property"},e}();t.UInt32Property=p;var d=function(){function e(e){o(e,this)}return e.prototype.write=function(e){i(e,this)},e.prototype.getType=function(){return"GearSavepointSaveGame"},e}();t.GearSavepointSaveGame=d,t.structs={GearSavepointSaveGame:d,ArrayProperty:u,IntProperty:m,Int32Property:c,UInt32Property:p}}),define("savepoint",["require","exports","./util","libvantage"],function(e,t,a,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var n=function(){function e(){}return e.read=function(t){var r=new e;return r.mapName=a.readString(t),r.mapId=t.readBytes(16),r.unknown=t.readBytes(16),r},e.prototype.write=function(e){a.writeString(e,this.mapName),e.writeBytes(this.mapId),e.writeBytes(this.unknown)},e}(),o=function(){function e(){}return e.read=function(t){var a=new e;return a.name=t.readUInt32(),a.instanceId=t.readUInt32(),a.parent=t.readInt32(),a},e.prototype.write=function(e){e.writeUInt32(this.name),e.writeUInt32(this.instanceId),e.writeInt32(this.parent)},e}(),i=function(){function e(){}return e.read=function(t){var r=new e;return r.package=a.readString(t),r.flag1=t.readInt32(),r.flag2=t.readInt32(),r},e.prototype.write=function(e){a.writeString(e,this.package),e.writeInt32(this.flag1),e.writeInt32(this.flag2)},e}(),s=function(){function e(){}return e.read=function(t){var a=new e;return a.objectName=t.readUInt32(),a.objectType=t.readInt32(),a.data=t.readBytes(t.readUInt32()+45),a},e.prototype.write=function(e){e.writeUInt32(this.objectName),e.writeInt32(this.objectType),e.writeUInt32(this.data.length-45),e.writeBytes(this.data)},e}(),l=function(){function e(){}return e.read=function(t){var a=new e;return a.propertyName=t.readUInt32(),a.flag=t.readBoolean(),a},e.prototype.write=function(e){e.writeUInt32(this.propertyName),e.writeBoolean(this.flag)},e}(),u=function(){function e(){}return e.read=function(t){var a=new e;return a.objectName=t.readUInt32(),a.data=t.readBytes(t.readUInt32()),a},e.prototype.write=function(e){e.writeUInt32(this.objectName),e.writeUInt32(this.data.length),e.writeBytes(this.data)},e}(),c=function(){function e(){}return e.read=function(t){var a=new e;return a.objectName=t.readUInt32(),a.unknown=t.readInt32(),a.data=t.readBytes(t.readUInt32()),a},e.prototype.write=function(e){e.writeUInt32(this.objectName),e.writeInt32(this.unknown),e.writeUInt32(this.data.length),e.writeBytes(this.data)},e}(),m=function(){function e(){}return e.read=function(t){var r=new e;return r.object=t.readUInt32(),r.properties1=t.readBytes(t.readUInt32()),r.properties2=t.readBytes(t.readUInt32()),r.type=a.readString(t),r},e.prototype.write=function(e){e.writeUInt32(this.object),e.writeUInt32(this.properties1.length),e.writeBytes(this.properties1),e.writeUInt32(this.properties2.length),e.writeBytes(this.properties2),a.writeString(e,this.type)},e}(),p=function(){function e(){}return e.read=function(t){var a=new e;return a.name=t.readUInt32(),a.type=t.readUInt32(),a},e.prototype.write=function(e){e.writeUInt32(this.name),e.writeUInt32(this.type)},e}(),d=function(){function e(){}return e.read=function(t){var r=new e;return r.header=n.read(t),r.objectNames=t.loopUInt32(o.read),r.strings=t.loopUInt32(a.readString),r.packageFlags=t.loopUInt32(i.read),r.structs=t.loopUInt32(s.read),r.levelFlags=t.loopUInt32(l.read),r.aiFactories=t.loopUInt32(u.read),r.navComponents=t.loopUInt32(c.read),r.objectProperties=t.loopUInt32(m.read),r.objectList=t.loopUInt32(function(){return t.readUInt32()}),r.unknown=t.readBytes(t.readUInt32()),r.objects=t.loopUInt32(p.read),r.footer=t.readToEnd(),r},e.prototype.write=function(e){this.header.write(e),this.writeData(e,this.objectNames),e.writeUInt32(this.strings.length),this.strings.forEach(function(t){return a.writeString(e,t)}),this.writeData(e,this.packageFlags),this.writeData(e,this.structs),this.writeData(e,this.levelFlags),this.writeData(e,this.aiFactories),this.writeData(e,this.navComponents),this.writeData(e,this.objectProperties),e.writeUInt32(this.objectList.length),this.objectList.forEach(function(t){return e.writeUInt32(t)}),e.writeUInt32(this.unknown.length),e.writeBytes(this.unknown),this.writeData(e,this.objects),e.writeBytes(this.footer)},e.prototype.writeData=function(e,t){e.writeUInt32(t.length),t.forEach(function(t){return t.write(e)})},e}(),_=function(){function e(e){this.data=d.read(new r.Stream(e)),this.objectNameStrings=this.parseObjectNames(this.data.objectNames)}return e.prototype.getOrAddStringIndex=function(e){var t=this.data.strings.indexOf(e);return-1!==t?t:(this.data.strings.push(e),this.data.strings.length-1)},e.prototype.replaceObjectName=function(e,t){var a=t.split("."),r=this.getNameAndInstanceId(a.pop()),n=r[0],o=r[1],i=this.objectNameStrings.indexOf(e),s=this.data.objectNames[i];s.name=this.getOrAddStringIndex(n),s.instanceId=o,s.parent=this.storeObjectName(this.data.objectNames,a),this.objectNameStrings[i]=t},e.prototype.getObjectName=function(e){return this.objectNameStrings[this.data.objects[e].name]},e.prototype.hasObjectName=function(e){return this.objectNameStrings.includes(e)},e.prototype.shouldLoadObject=function(e){return this.objectNameStrings.includes(e)&&-1!==this.getObjectStruct(e).objectType},e.prototype.isStructReplaceable=function(e){return this.objectNameStrings.includes(e)&&-1===this.getObjectStruct(e).objectType},e.prototype.getObjectIndex=function(e,t,a){var r=this.storeObjectName(this.data.objectNames,e.split(".")),n=this.storeObjectName(this.data.objectNames,t.split(".")),o=this.data.objects.findIndex(function(e){return e.name===r&&e.type===n});if(-1!==o)return o;var i=new p;i.name=r,i.type=n;var s=n;return a?(this.data.objectList.push(r),s=this.data.objects.length):this.data.objectList.push(n),this.data.objects.push(i),s},e.prototype.getSimpleObjectIndex=function(e,t){var a=this.storeObjectName(this.data.objectNames,t.split(".")),r=this.storeObjectName(this.data.objectNames,e.split(".")),n=this.data.objects.findIndex(function(e){return e.name===r&&e.type===a});if(-1!==n)return n;var o=new p;o.name=r,o.type=a;var i=r;return this.data.objects.push(o),i},e.prototype.getObjectStruct=function(e){var t=this;return this.data.structs.find(function(a){return a.objectName===t.objectNameStrings.indexOf(e)})},e.prototype.getObjectStructs=function(e,t){var a=this,r=this.objectNameStrings.filter(function(t){return t.includes(e+"_")});t&&r.sort();var n=[];return r.forEach(function(e){var t=a.getObjectStruct(e);a.shouldLoadObject(e)&&(n[e]=t)}),n},e.prototype.setObjectStruct=function(e,t){var a=this.getObjectStruct(e);if(!a)throw Error("did not find structure!");a.data=t},e.prototype.setObjectStructAndType=function(e,t,a){var r=this.getObjectStruct(e);if(!r)throw Error("did not find structure!");r.data=a,r.objectType=t},e.prototype.addObjectStruct=function(e,t,a){var r=new s;r.objectType=t,r.objectName=e,r.data=a,this.data.structs.push(r),this.objectNameStrings=this.parseObjectNames(this.data.objectNames),this.data.objectNames=this.serializeObjectNames()},e.prototype.deleteObjectStruct=function(e){var t=this.getObjectStruct(e);if(!t)throw Error("did not find structure!");t.objectType=-1;var a=this.objectNameStrings.indexOf(e);this.data.objectList=this.data.objectList.filter(function(e){return e!==a})},e.prototype.getInstanceId=function(e){var t=e.lastIndexOf("_");if(-1!==t){var a=e.substr(t+1);if(0!==a.length&&("0"===a||a.match(/^[1-9][0-9]*$/)))return parseInt(a)+1}return 0},e.prototype.parseObjectNames=function(e){var t=this.data.strings;return e.map(function(a,r){var n=[];do{var o=e[r];n.push(t[o.name]+(o.instanceId?"_"+(o.instanceId-1):"")),r=o.parent}while(-1!==r);return n.reverse().join(".")})},e.prototype.serializeObjectNames=function(){var e=this,t=[];return this.objectNameStrings.forEach(function(a){return e.storeObjectName(t,a.split("."))}),t},e.prototype.storeObjectName=function(e,t){var a=this,r=-1;return t.forEach(function(t){var n=a.getNameAndInstanceId(t),o=n[0],i=n[1];r=a.storeObjectPathPart(e,o,i,r)}),r},e.prototype.getNameAndInstanceId=function(e){var t=e.lastIndexOf("_");if(-1!==t){var a=e.substr(t+1);if(0!==a.length&&("0"===a||a.match(/^[1-9][0-9]*$/)))return[e.substr(0,t),parseInt(a)+1]}return[e,0]},e.prototype.storeObjectPathPart=function(e,t,a,r){var n=this.data.strings,i=e.findIndex(function(e){return e.parent===r&&e.instanceId===a&&n[e.name]===t});if(-1!==i)return i;var s=new o;return s.name=this.getOrAddStringIndex(t),s.instanceId=a,s.parent=r,e.push(s),e.length-1},e.prototype.toBuffer=function(){this.objectNameStrings=this.parseObjectNames(this.data.objectNames),this.data.objectNames=this.serializeObjectNames();var e=r.Stream.reserve(512e3);return this.data.write(e),e.getBuffer()},e}();t.SavepointBinaryBlob=_}),define("util",["require","exports"],function(e,t){"use strict";function a(e){var t=e.readUInt32();if(0===t)return"";var a=e.readString("ascii",t-1);return e.position++,a}function r(e,t){e.writeUInt32(t.length+1),e.writeString(t,"ascii",!0)}Object.defineProperty(t,"__esModule",{value:!0}),t.readString=a,t.writeString=r}),define("weapons",["require","exports"],function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=[{name:"Assault Rifle",model:"/Game/Weapons/COG/COG_AssaultRifle/BP_AssaultRifle.BP_AssaultRifle_C",clipSize:60},{name:"Marcus Assault Rifle",model:"/Game/Weapons/COG/COG_AssaultRifle/BP_AssaultRifle_Marcus_Gift.BP_AssaultRifle_Marcus_Gift_C",clipSize:60},{name:"Marcus Assault Rifle (VTAR)",model:"/Game/Weapons/COG/COG_AssaultRifle/BP_AssaultRifle_Marcus_VTAR.BP_AssaultRifle_Marcus_VTAR_C",clipSize:60},{name:"Retro Lancer",model:"/Game/Weapons/COG/COG_RetroLancer/BP_RetroLancer.BP_RetroLancer_C",clipSize:20},{name:"Gnasher",model:"/Game/Weapons/COG/COG_Gnasher/BP_Gnasher.BP_Gnasher_C",clipSize:8},{name:"Locust Hammerburst",model:"/Game/Weapons/Locust/Locust_Hammerburst/BP_LocustHammerburst.BP_LocustHammerburst_C",clipSize:21},{name:"Boomshot",model:"/Game/Weapons/Locust/Locust_Boomshot/BP_Boomshot.BP_Boomshot_C",clipSize:1},{name:"Longshot",model:"/Game/Weapons/COG/COG_Longshot/BP_Longshot.BP_Longshot_C",clipSize:1},{name:"Hammer of Dawn",model:"/Game/Weapons/COG/COG_HOD/BP_HOD_Prologue.BP_HOD_Prologue_C",clipSize:0},{name:"Markza",model:"/Game/Weapons/UIR/UIR_Markza/BP_GearWeap_UIR_Markza_Mk1.BP_GearWeap_UIR_Markza_Mk1_C",clipSize:5},{name:"Markza (Flashlight)",model:"/Game/Weapons/UIR/UIR_Markza/BP_GearWeap_UIR_Markza_Mk1_Flashlight.BP_GearWeap_UIR_Markza_Mk1_Flashlight_C",clipSize:5},{name:"Mega Robot Stapler",model:"/Game/Weapons/DeeBee/MegaStapler/BP_MegaStapler.BP_MegaStapler_C",clipSize:1e6},{name:"Mulcher",model:"/Game/Weapons/Locust/Locust_Boomshot/BP_Boomshot.BP_Boomshot_C",clipSize:1},{name:"Snub Pistol",model:"/Game/Weapons/COG/COG_Pistol/BP_Snub_Pistol.BP_Snub_Pistol_C",clipSize:12},{name:"Burst Pistol",model:"/Game/Weapons/Locust/Locust_BurstPistol/BP_Burst_Pistol.BP_Burst_Pistol_C",clipSize:100},{name:"Frag Grenade",model:"/Game/Weapons/Common/Grenades/BP_GearWeap_FragGrenade.BP_GearWeap_FragGrenade_C",clipSize:1},{name:"Bunker Frag Grenade",model:"/Game/Weapons/Common/Grenades/BP_GearWeap_PrologueFragGrenade.BP_GearWeap_PrologueFragGrenade_C",clipSize:1},{name:"COG Frag Grenade",model:"/Game/Weapons/Common/Grenades/BP_GearWeap_FragGrenade_COG.BP_GearWeap_FragGrenade_COG_C",clipSize:1},{name:"Incendiary Grenade",model:"/Game/Weapons/Common/Grenades/BP_GearWeap_IncendiaryGrenade.BP_GearWeap_IncendiaryGrenade_C",clipSize:1},{name:"Smoke Grenade",model:"/Game/Weapons/Common/Grenades/BP_GearWeap_SmokeGrenade.BP_GearWeap_SmokeGrenade_C",clipSize:1},{name:"DeeBee EMBAR",model:"/Game/Weapons/DeeBee/DeeBee_EM_Rifle/BP_DeeBee_EM_Rifle.BP_DeeBee_EM_Rifle_C",clipSize:3},{name:"DeeBee Enforcer",model:"/Game/Weapons/DeeBee/DeeBee_SMG/BP_GearWeap_DeeBee_SMG_PeaceMaker.BP_GearWeap_DeeBee_SMG_PeaceMaker_C",clipSize:40},{name:"DeeBee TriShot",model:"/Game/Weapons/DeeBee/Guardian_TriShot/BP_TriShot.BP_TriShot_C",clipSize:140},{name:"Salvo Rocket Launcher",model:"/Game/Weapons/DeeBee/DeeBee_GrenadeLauncher/BP_GearWeap_GrenadeLauncher.BP_GearWeap_GrenadeLauncher_C",clipSize:1},{name:"Mega Robot Stapler",model:"/Game/Weapons/DeeBee/MegaStapler/BP_MegaStapler.BP_MegaStapler_C",clipSize:1e6},{name:"Hammer of Dawn",model:"/Game/Weapons/COG/COG_HOD/BP_HOD_Prologue.BP_HOD_Prologue_C",clipSize:0},{name:"Boomshot",model:"/Game/Weapons/Locust/Locust_Boomshot/BP_Boomshot.BP_Boomshot_C",clipSize:1},{name:"Mulcher",model:"/Game/Weapons/COG/COG_GatlingGun/BP_Heavy_MiniGun.BP_Heavy_MiniGun_C",clipSize:250},{name:"Shock Grenade",model:"/Game/Weapons/Common/Grenades/BP_GearWeap_ShockGrenade.BP_GearWeap_ShockGrenade_C",clipSize:1},{name:"Shock Enforcer",model:"/Game/Weapons/DeeBee/DeeBee_SMG/BP_GearWeap_DeeBee_SMG_PeaceKeeper.BP_GearWeap_DeeBee_SMG_PeaceKeeper_C",clipSize:40},{name:"Overkill",model:"/Game/Weapons/DeeBee/DeeBee_Shotgun/BP_GearWeap_DeeBee_Shotgun.BP_GearWeap_DeeBee_Shotgun_C",clipSize:8},{name:"R-4 Salvo",model:"/Game/Weapons/DeeBee/DeeBee_GrenadeLauncher/BP_GearWeap_RocketLauncher_Wreckage.BP_GearWeap_RocketLauncher_Wreckage_C",clipSize:1},{name:"Buzzkill",model:"/Game/Weapons/BTProto/Scrapshot/BP_GearWeap_Buzzkill.BP_GearWeap_Buzzkill_C",clipSize:1},{name:"Boltok",model:"/Game/Weapons/Locust/Locust_Pistol/BP_Boltock_Pistol.BP_Boltock_Pistol_C",clipSize:6},{name:"Torque Bow",model:"/Game/Weapons/Locust/Locust_TorqueBow/BP_TorqueBow.BP_TorqueBow_C",clipSize:1}]}),define("text!editor.html",["module"],function(e){
e.exports='<template><require from="libvantage/vantage.css"></require><header>Player</header><style>v-number input{width:200px}v-selection{max-width:270px}</style><card label="Model"><v-selection value.bind="playerModel" options.bind="availablePlayerModels"></v-selection></card><card><table><thead><th>X Coordinate</th><th>Y Coordinate</th><th>Z Coordinate</th></thead><tbody><td><v-number value.bind="player.coordinates.X" min="-100000000000000" max="100000000000000"></v-number></td><td><v-number value.bind="player.coordinates.Y" min="-100000000000000" max="100000000000000"></v-number></td><td><v-number value.bind="player.coordinates.Z" min="-100000000000000" max="100000000000000"></v-number></td></tbody></table></card><header>Weapons</header><card label="Max Ammo"><v-button click.delegate="maxAmmo()">Max Ammo</v-button></card><card label="Left Slot"><v-selection value.bind="weapons[2].model" options.bind="availableWeapons"></v-selection><v-number max="100000000" value.bind="weapons[2].ammo"></v-number></card><card label="Right Slot"><v-selection value.bind="weapons[3].model" options.bind="availableWeapons"></v-selection><v-number max="100000000" value.bind="weapons[3].ammo"></v-number></card><card label="Top Slot"><v-selection value.bind="weapons[1].model" options.bind="availableWeapons"></v-selection><v-number max="100000000" value.bind="weapons[1].ammo"></v-number></card><card label="Bottom Slot"><v-selection value.bind="weapons[0].model" options.bind="availableWeapons"></v-selection><v-number max="100000000" value.bind="weapons[0].ammo"></v-number></card><card label="Extra Slot"><v-selection value.bind="weapons[4].model" options.bind="availableWeapons"></v-selection><v-number max="100000000" value.bind="weapons[4].ammo"></v-number></card><header>Squad AI</header><card label="Max Ammo for Entire Squad"><v-button click.delegate="maxAllAIAmmo()">Max Ammo</v-button></card><card><table><thead><th>Model</th><th>Editing</th><th>Clone</th><th>Delete</th></thead><tbody><template repeat.for="aiController of aiControllerMap | objectKeys & signal:\'ai-signal\'"><tr if.bind="aiController"><td><v-selection value.bind="aiController.type" options.bind="availablePlayerModels"></v-selection></td><td><v-button click.delegate="editAIProperties(aiController)">Edit Properties</v-button></td><td><v-button click.delegate="cloneAI(aiController)">Clone</v-button></td><td><v-button click.delegate="deleteAI(aiController)">Delete</v-button></td></tr></template></tbody></table></card><header>AI Position</header><card><table><thead><th>X Coordinate</th><th>Y Coordinate</th><th>Z Coordinate</th></thead><tbody><td><v-number value.bind="aiCoordinates.X" min="-100000000000000" max="100000000000000"></v-number></td><td><v-number value.bind="aiCoordinates.Y" min="-100000000000000" max="100000000000000"></v-number></td><td><v-number value.bind="aiCoordinates.Z" min="-100000000000000" max="100000000000000"></v-number></td></tbody></table></card><header>AI Weapons</header><card label="Max Ammo"><v-button click.delegate="maxAIAmmo()">Max Ammo</v-button></card><card label="Left Slot"><v-selection value.bind="aiWeapons[2].model" options.bind="availableWeapons"></v-selection><v-number max="100000000" value.bind="aiWeapons[2].ammo"></v-number></card><card label="Right Slot"><v-selection value.bind="aiWeapons[3].model" options.bind="availableWeapons"></v-selection><v-number max="100000000" value.bind="aiWeapons[3].ammo"></v-number></card><card label="Top Slot"><v-selection value.bind="aiWeapons[1].model" options.bind="availableWeapons"></v-selection><v-number max="100000000" value.bind="aiWeapons[1].ammo"></v-number></card><card label="Bottom Slot"><v-selection value.bind="aiWeapons[0].model" options.bind="availableWeapons"></v-selection><v-number max="100000000" value.bind="aiWeapons[0].ammo"></v-number></card><card label="Extra Slot"><v-selection value.bind="aiWeapons[4].model" options.bind="availableWeapons"></v-selection><v-number max="100000000" value.bind="aiWeapons[4].ammo"></v-number></card></template>'});