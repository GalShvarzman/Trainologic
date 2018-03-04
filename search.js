const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const ext = args[0];
const str = args[1];
const currentDir = __dirname;

searchFiles();

function readDir(dir){
    return new Promise((resolve,reject)=>{
        fs.readdir(dir, (err, files)=>{
            if(err) reject(err);
            else{
                resolve(files);
            }
        })
    })
}

function getStat(path){
    return new Promise((resolve,reject)=>{
        fs.stat(path, (err, stats)=>{
            if(err) reject(err);
            else{
                resolve(stats);                
            }
        })
    })
}

function readFile(filePath){
    return new Promise((resolve,reject)=>{
        fs.readFile(filePath, (err, data)=>{
            if (err) reject(err);
            else{
                resolve(data);
            } 
        })
    })
}

function getAllFilesFilteredByExt(dir, fileList){
    return readDir(dir)
        .then((files)=>{
            const promises = files.map((file)=>{
                return getStat(path.join(dir, file))
                    .then((stats)=>{
                        if(stats.isDirectory()){
                            return getAllFilesFilteredByExt(path.join(dir, file), fileList);
                        }
                        else{
                            if(path.extname(file) == `.${ext}`){
                                fileList.push(path.join(dir, file));
                            }   
                        }
                    })   
            });
            return Promise.all(promises);
        })
        .then(()=>{
            return fileList
        })  
}

function searchFiles(){
    if(ext && str){
        const filteredFiles = [];
        getAllFilesFilteredByExt(currentDir, [])
            .then((allFilesPathFilteredByExt)=>{
                if(allFilesPathFilteredByExt.length > 0){
                    const filesFilteredByStrPromises = allFilesPathFilteredByExt
                        .map((filePath)=>{
                            return readFile(filePath)
                                .then((data)=>{
                                    if(data.toString().search(str) != -1){
                                        filteredFiles.push(filePath);
                                    }
                                })
                        });
                    return Promise.all(filesFilteredByStrPromises)
                        .then(()=>{
                            return filteredFiles;
                        })      
                }
                else{
                    return [];
                }
            })
            .then((filteredFiles)=>{
                if(filteredFiles.length > 0){
                    filteredFiles.forEach((file)=>{
                        console.log(file);
                    })
                }
                else{
                    console.log('No file was found');
                }
            })
            .catch((err)=>{
                console.error(`Oops, something went wrong : ${err.massage}`);
            })
    }
    else{
        console.log('USAGE: node search [EXT] [TEXT]');
    }
}