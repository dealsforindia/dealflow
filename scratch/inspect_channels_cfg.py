import pymongo

client = pymongo.MongoClient('mongodb://localhost:27017/')
db = client['dealbot']
cfg = db.SystemSettings.find_one({'_id': 'channels_config'}) or {}
channels = cfg.get('channels', {})
print(f"Total configured channels: {len(channels)}")

fk = [k for k in channels.keys() if 'freekart' in k.lower() or '1394855402' in k]
print(f"Freekart keys in channels_config: {fk}")

aliases = cfg.get('aliases', {})
fk_alias = {k: v for k, v in aliases.items() if 'freekart' in k.lower() or '1394855402' in k or 'freekart' in str(v).lower()}
print(f"Freekart aliases: {fk_alias}")
