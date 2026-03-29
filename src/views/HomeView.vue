<template>
  <main>
    <div class="container">
      <img src="@/assets/logo.webp" alt="" class="logo">
      <h1 class="title">Mesfor File Convertor</h1>
      <p class="text-format">Convert your CSV-JSON, JSON-CSV file without compromising on image quality.</p>
      <form @submit.prevent="sendFile()" enctype="multipart/form-data" class="form">
        <div class="dimentions">
         FROM: 
          <select v-model="sourceFile">
            <option value="csv" selected>Csv</option>
            <option value="json" selected>Json</option>
          </select>
          TO:
          <select v-model="targetFile">
            <option value="json" selected>Json</option>
            <option value="csv" selected>csv</option>
          </select>
        </div>
        <div class="dropzone" v-if="!fileName">
           <input type="file" class="input-field" accept="text/*, application/json" ref="file" id="file" @change="sendFile()">
          <!-- <input type="file" class="input-field" multiple accept="image/png, image/gif, image/jpeg" ref="file" id="files" @change="sendFile()"> -->
          <div v-if="!fileName" class="img-container">
            <img src="@/assets/upload.png" alt="" width="70px">
            <p class="drag-text">Click here to upload files...</p>
            <span class="warning-text">Each file must be less then 10 MB</span>
          </div>
        </div>
        <ul class="progress-side">
          <div v-if="isLoader" class="loader-con">
            <Loader />
          </div>
          <div v-if="fileName">
            <li class="progress-con" ref="list">
              <div class="progress-left"><img :src="`/uploads/${this.imagePath}/${fileName}`" alt="" width="40px" class="images"></div>
              <div class="progress-center">
                <div class="progress-center-top">
                  <span class="file-name">{{fileName}}</span>
                  <span class="file-status">Progress</span>
                </div>
                <div class="progress-center-bottom">
                  <progress  class="progress is-link" :value="progress" max="100"></progress>
                </div>
              </div>
              <div class="progress-right" @click="clearForm()">
                <a :href="`/uploads/${this.imagePath}/${fileName}`" download><img src="@/assets/download.png" alt="" class="cp" width="30px"></a>
              </div>
            </li>
          </div>
        </ul>
      </form>
      <div class="footer" v-if="fileName">
        <button id="clear-all" class="clear-all" @click="clearForm()">Clear All <img src="@/assets/clear.png" alt="" class="clear-btn-img"/></button>
      </div>
    </div>
  </main>
</template>

<script>
import axios from 'axios'
import Loader from '@/components/loader-component.vue'
export default {
  name:'ImageCompressor',
  components:{Loader},
  data () {
    return {
      fileName: '',
      progress: 0,
      isLoader: false,
      imagePath: 0,
      sourceFile: 'csv',
      targetFile: 'json'
    }
  },
  methods:{
    async sendFile(){
      const formData = new FormData()
      let files = this.$refs.file.files
      if(this.sourceFile == this.targetFile){
        this.$refs.file.value = null
        alert('Source-Format and Target-Format cant be same!')
        return false
      }
      if(this.sourceFile != files[0].name.split('.').pop()){
        this.$refs.file.value = null
        alert('Source-File-Format not correct!')
        return false
      }
      try {
        if(files[0].size > 1e+7){
          alert('Toatal File size must be less 10 MB')
        } else {
          if (!files[0].name.match(/\.(csv|json)$/i)){
            alert('Some file is not image type!');
            return false
          } else {
            formData.append('files', files[0])
            this.isLoader = true
          }
          this.imagePath = Math.floor(Math.random() * 123456789)
          const res = await axios.post(`/api/convert/${this.sourceFile}-${this.targetFile}/${this.imagePath}` , formData, {
            onUploadProgress: e => {
              this.progress = Math.round(e.loaded * 100 / e.total)
            }
          })
          if(res.data.code == 200){
            this.fileName = res.data.filename
            console.log(this.fileName)
            this.$refs.file.value = null
          } else {
            alert(res.data.error)
          }
          this.$refs.file.value = null
          this.isLoader = false
        }
      } catch (error) {
        console.error(error)
        this.isLoader = false
      }
    },
    clearForm(){
      setTimeout(() => {
        this.fileName = ''
        this.removeImages()
      }, 200)
    },
    async removeImages(){
      await axios.post('/api/remove-images', {imagepath: this.imagePath}).then((result) => {
        console.log(result.data)
      })
    }
  }
}
</script>

<style scoped>
.cp{cursor: pointer;}
  .container{
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 30vw;
    margin: 0 auto;
  }
  .form{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
  }
  .title{
    font-size: 30px;
    color: #545454;
    margin-top: 30px;
  }
  .text-format{
    color: #666;
    font-size: 13px;
    margin: 20px 0;
  }
  .warning-text{
    font-size: 12px;
    color: #bababa;
    margin-top: 10px;
    margin-bottom: 5px;
  }
  .logo{margin-top: 50px;}
  .dropzone {
    display: flex;
    justify-content: center;
    align-items: center;
    min-width: 100%;
    min-height: 240px;
    padding: 10px;
    position: relative;
    cursor: pointer;
    border: 2px dashed rgb(194, 184, 224);
    border-radius: 20px;
  }
  .img-container{
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .input-field{
    width: 100%;
    height: 200px;
    padding: 10px;
    position: absolute;
    opacity: 0;
    cursor: pointer;
  }

  .dropzone .drag-text{
    color: #545454;
    font-size: 17px;
    font-weight: 700;
    margin-top: 20px;
  }
  .progress-side{
    width: 100%;
    margin-top: 30px;
  }
  .progress-con{
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 60px;
    width:100%;
    border-radius: 10px;
    border: 1px solid rgb(58,90,64);
    margin: 7px 0;
  }
  .dimentions{
    display: flex;
    justify-content: space-around;
    align-items: center;
    height: 46px;
    width:100%;
    border-radius: 6px;
    border: 1px solid #ccc;
    margin: 40px auto;
  }
  select{
    appearance: none;
    outline: 0;
    width: 35%;
    padding: 0 10px;
    background: url('@/assets/select-arrow.webp') no-repeat right 10px center / 16px,
    linear-gradient(to left, #ddd 36px, #f1f1f1 36px);
    color: black;
    height: 30px;
    border: 1px solid #ccc;
    border-radius: 3px;
    cursor: pointer;
    font-size: calc(14px + 0.1vw);
  }
  .progress-right, .progress-left{
    padding: 10px;
  }
  .progress-left{
    display: flex;
    justify-content: center;
    align-items: center;
    width: 50px;
    height: 50px;
  }
  .progress-center{
    width: 100%;
  }
  .progress-center-top{
    display: flex;
    justify-content: space-between;
    padding: 5px 0;
  }
  .file-name, .file-status{
    font-size: 12px;
    color: rgb(58,90,64);
  }
  .file-status{margin-right: 10px;}
  .progress{
    width: 100%;
  }
  ul{
    list-style: none;
  }
  .download-btn-con{
    display: flex;
    justify-content: space-between;
    width: fit-content;
    background-color: rgb(58,90,64);
    padding: 5px 10px;
    border-radius: 4px;
  }
  .footer{
    display: flex;
    justify-content: center;
    width: 100%;
    padding: 20px 0;
  }
  .download-all, .clear-all{
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    width: fit-content;
    font-size: 16px;
  }
  .download-all{
    color: #fff;
    background-color: rgb(58,90,64);
    margin-right: 10px;
  }
  .clear-all{
    min-width: 160px;
    color: rgb(58,90,64);
    border: 1px solid rgb(58,90,64);
    margin-right: 20px;
    border-radius: 4px;
  }
  .download-btn-con:hover, .clear-all:hover{
    filter: brightness(120%);
    cursor: pointer;
  }
  .download-all:hover{cursor: pointer;}
  .clear-btn-img{
    width: 32px;
    margin-left: 50px;
  }
  .download-btn-img{
    width: 32px;
    margin-left: 10px;
  }
  .loader-con{
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
  }
  @media screen and (max-width: 1080px){
    .container{ 
      width: 100vw;
      padding: 10px;
    }

  }
</style>
