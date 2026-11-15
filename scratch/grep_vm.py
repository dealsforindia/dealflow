import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('74.225.250.0', username='rudranil777')
_, stdout, stderr = client.exec_command('grep -rn "New DesiDime Deal" /home/rudranil777/dealbot/')
print("STDOUT:", stdout.read().decode('utf-8', errors='ignore'))
print("STDERR:", stderr.read().decode('utf-8', errors='ignore'))
client.close()
