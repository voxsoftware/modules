// Instalador TriBot v0.0.1
import Os from 'os'
import Path from 'path'
import fs from 'fs'
import Child from 'child_process'

var machineId, ws, colors
install()

async function load(){
	var stdpath= await import("https://kwx.kodhe.com/x/v/0.4.4/std/dist/stdlib")
	kawix.KModule.addVirtualFile("@kawix/std", {
		redirect: stdpath.dirname,
		isdirectory: true
	})
	var gixpath= await import("https://kwx.kodhe.com/x/v/0.4.4/gix/dist/gix")
	kawix.KModule.addVirtualFile("@kawix/gix", {
		redirect: gixpath.dirname,
		isdirectory: true
	})
	var dhspath= await import("https://kwx.kodhe.com/x/v/0.4.4/dhs/dist/dhs")
	kawix.KModule.addVirtualFile("@kawix/dhs", {
		redirect: gixpath.dirname,
		isdirectory: true
	})
	var kivipath= await import("https://kwx.kodhe.com/x/v/0.4.4/kivi/dist/kivi")
	kawix.KModule.addVirtualFile("@kawix/kivi", {
		redirect: gixpath.dirname,
		isdirectory: true
	})
	await import("/virtual/@kawix/std/coffeescript/register")
	colors= await import('npm://colors@1.3.3/safe')
	machineId = (await import("npm://node-machine-id@1.1.10")).machineId
	ws= await import('npm://windows-shortcuts@0.1.6')
}

function progress(limit = 50, step= 5){
	var num= 0
	progress.set= function(value){
		num= value
		write.wri && write.wri.call(process.stdout, "#@progress|" + num + "\n")
	}

	progress.limit= function(value){
		limit = value
	}

	progress.step= function(value){
		step = value
	}

	progress.timer= setInterval(function(){
		num+= step
		if(num > limit)
			num= limit
		write.wri && write.wri.call(process.stdout, "#@progress|" + num + "\n")
	}, 1000)
}

function sleep(time){
	return new Promise(function(a,b){
		setTimeout(a, time)
	})
}

async function write (){
	var w = Path.extname(kawix.mainFilename) == ".kwo"

	if(w){
		write.kwo= true
		var wri= write.wri= process.stdout.write
		var str1= ''

		var change= function(stdout){
			return function(str){
				var ostr= str
				str1+= str.toString()
				var y= str1.indexOf("\n")
				if(y >= 0){
					str= str1.substring(0, y)
					str1= str1.substring(y+1)
				}else{
					str=''
				}

				lines= str.split("\n")
				for(var i=0;i<lines.length;i++){
					wri.call(process.stdout, "#@log|"+ lines[i].trim() + "\n")
				}
				wri.call(stdout, ostr)
			}
		}
		process.stdout.write= change(process.stdout)
		process.stderr.write= change(process.stderr)
		wri.call(process.stdout, "#@form\n")

	}
}

readLineAsync._str= ''
function readLineAsync(char) {
    var def, read, ref, str
    if (char && readLineAsync._str) {
      return readLineAsync._str[0]
    }
    str = (ref = readLineAsync._str) != null ? ref : ''
    def = {}
	def.promise= new Promise(function(a,b){
		def.resolve= a
		def.reject = b
	})
    read = (d) => {
      var i
      d = str + d.toString()
      if (char) {
        readLineAsync._str = d.substring(1)
        return def.resolve(d[0])
      }
      i = d.indexOf("\n")
      if (i >= 0) {
        readLineAsync._str = d.substring(i + 1)
        d = d.substring(0, i)
        if (d.endsWith("\r")) {
          d = d.substring(0, d.length - 1)
        }
        return def.resolve(d)
      } else {
        readLineAsync._str = d
        return process.stdin.once("data", read)
      }
    }
    process.stdin.once("data", read)
    return def.promise
  }




async function install(){

	try{
		await write()
		progress(20)
		await load()

		process.title = "Tribot Installer"
		//process.stdout.write('c')
		process.stdout.write("\u001b[2J\u001b[0;0H")
		process.stdout.write("\n " + colors.yellow("Escriba la llave de instalación: "))
		var key= await readLineAsync()



		var KwaInstaller= await KModule.import("/virtual/@kawix/std/package/kwa/installer.coffee",{
			force: true
		})
		KwaInstaller= KwaInstaller.default


		// cache gix Module?
		progress.limit(80)
		progress.set(20)
		progress.step(0.5)


		var Gui=await import("/virtual/@kawix/gix/src/gui")
		var ui= new Gui.default("org.kodhe.tribot")
		await ui.requestSingleInstanceLock()



		progress.set(80)
		progress.limit(95)
		//await import("npm://@vue/component-compiler-utils@2.6.0")


		var installurls= [
			"https://raw.githubusercontent.com/voxsoftware/modules/master/kowix",
			"https://raw.githubusercontent.com/voxsoftware/modules/master/auth.kw",
			"https://raw.githubusercontent.com/voxsoftware/modules/master/org.kodhe.tribot"
		]


		var modulespath= Path.join(Os.homedir(), "Kawix", "modules")
		var installpath= Path.join(Os.homedir(), "Kawix", "apps")
		var file
		if(!fs.existsSync(installpath)){
			fs.mkdirSync(installpath)
		}
		installpath= Path.join(installpath, "Tribot")
		if(!fs.existsSync(installpath)){
			fs.mkdirSync(installpath)
		}

		var installer, result, installers= [], results= []
		await import('/virtual/@kawix/std/package/kwa/register')


		installer= new KwaInstaller({
			version: '3.x',
			url: installurls[0]
		})
		result= await installer.installInfo()
		if(result.needupdate){
			installers.push({
				name: 'kowix',
				description: 'Kowix version ' + result.version,
				installer
			})
		}
		else{
			results.push(result)
		}

		installer= new KwaInstaller({
			version: '0.x',
			url: installurls[1]
		})
		result= await installer.installInfo()
		if(result.needupdate){
			installers.push({
				name: 'auth.kw',
				description: 'Auth.kw version ' + result.version,
				installer
			})
		}
		else{
			results.push(result)
		}


		installer= new KwaInstaller({
			version: '0.2.x',
			url: installurls[2],
			key: key, //"e2981b460eaa64b3d68b426a8250dc77dec79fe2",
			"machineid": Buffer.from(await machineId(),'hex').toString('base64')
		})
		result= await installer.installInfo()
		if(result.needupdate){
			installers.push({
				name: 'org.kodhe.tribot',
				description: 'Tribot version ' + result.version,
				installer
			})
		}
		else{
			results.push(result)
		}

		if(!installers.length){
			process.stdout.write('c')
			console.info(colors.yellow(" Tribot está instalado/actualizado correctamente"))
		}else{
			process.stdout.write('c')
			console.info(" Actualizando dependencias")
			for(var i=0;i<installers.length;i++){
				result= await installers[i].installer.install()
				console.info(" Instalado: " + colors.yellow(installers[i].name + "@" + result.version))
				results.push(result)
			}

		}


		var installDep= function(dep){
			var name= dep.name, ndep
			var file= Path.join(installpath, dep.name+".kwa")
			if(dep.installed || !fs.existsSync(file)){
				fs.copyFileSync(Path.join(modulespath, dep.name + "." + (result.localversion || result.version) + ".kwa"), file)
			}
			if(dep.deps && dep.deps.length){
				for(var i=0;i<dep.deps.length;i++){
					ndep= dep.deps[i]
					installDep(ndep)
				}
			}
		}

		for(var i=0;i<results.length;i++){
			result= results[i]
			installDep(result)
		}

		var content= `
import * as dhs from "./dhs-mod.js"
import "/virtual/@kawix/std/package/kwa/register"
import {gix as Gui}  from '/virtual/@kawix/gix/mod.js'
import Path from 'path'
import Cluster from 'cluster'
import {machineId} from 'npm://node-machine-id@1.1.10'
//import '../kowix/load'
import {Module} from 'module'
init()
async function init(){
	var mid= Buffer.from(await machineId(),'hex').toString('base64')
	global.__machineId= mid
	console.log(mid)


	// load app
	var modinfo, folderapp
	try{
		modinfo = await import('./org.kodhe.tribot.kwa')
		folderapp= modinfo['kawix.app'].resolved
	}catch(e){
		folderapp= module.realPathResolve("org.kodhe.tribot")
	}

	var kowixinfo= await import('./kowix.kwa')
	var kowixfolder= kowixinfo['kawix.app'].resolved
	await import(Path.join(kowixfolder, 'load'))


	var ui
	if(Cluster.isMaster){
		// start electron
		global.gix= ui= new Gui("org.kodhe.tribot")
		if (! await ui.requestSingleInstanceLock())
			return process.exit()

		ui.startReadEvents()
	}


	var configfile= Path.join(__dirname, "..", "app", "main.config")
	configfile= Path.join(__dirname, "main.config")
	var config= new dhs.Config(configfile)
	var service = new dhs.Service(config)
	await service.start()


	var sleep= function(time){
		return new Promise(function(a,b){
			setTimeout(a,time)
		})
	}
	var started1
	if(Cluster.isMaster){


		service.once("listen", async function(ip){

			process.stdout.write("@#detach\\n")

			// esperar que haya cargado org.kodhe.tribot
			while(true){
				if(config._config && config._config.sites){
					let site
					for(var i=0;i<config._config.sites.length;i++){

						site= config._config.sites[i]
						if (site.name == "org.kodhe.tribot")
							break
						site=null
					}
					if(site)
						break
				}
				await sleep(50)
			}

			var ctx= service.getContext("org.kodhe.tribot")
			started1= true

			var mod= await import(Path.join(folderapp, '/src/functions'))
			var siteCtx= await mod.getSiteContext({
				request: null,
				response: null,
				reply: null
			}, ctx)

			await siteCtx.userFunction("desktop/app.boot").invoke({
				url: "http://" + ip.address + ":" + ip.port + "/site/org.kodhe.tribot/ui/home"
			})
		})

	}

}
		`
		await fs.writeFileAsync(Path.join(installpath, 'App.kwe'), content)

		content= `
import './preload'

import mod from '/virtual/@kawix/dhs/src/mod.js'
import _Service from '/virtual/@kawix/dhs/src/service'
import _Config from '/virtual/@kawix/dhs/src/config'
export var start= function(){
	return import("/virtual/@kawix/dhs/start.js")
}
export var Service = _Service
export var Config = _Config
export var startClustered= function(){
	return import("/virtual/@kawix/dhs/start.clustered.js")
}
		`
		await fs.writeFileAsync(Path.join(installpath, 'dhs-mod.js'), content)

		content= `

import stdpath1 from 'https://kwx.kodhe.com/x/v/0.4.4/dhs/dist/dhs'
import stdpath2 from 'https://kwx.kodhe.com/x/v/0.4.4/std/dist/stdlib'
import stdpath3 from 'https://kwx.kodhe.com/x/v/0.4.4/gix/dist/gix'
import stdpath4 from 'https://kwx.kodhe.com/x/v/0.4.4/kivi/dist/kivi'


kawix.KModule.addVirtualFile("@kawix/std", {
	redirect: stdpath2.dirname,
	isdirectory: true
})
kawix.KModule.addVirtualFile("@kawix/dhs", {
	redirect: stdpath1.dirname,
	isdirectory: true
})
kawix.KModule.addVirtualFile("@kawix/gix", {
	redirect: stdpath3.dirname,
	isdirectory: true
})
kawix.KModule.addVirtualFile("@kawix/kivi", {
	redirect: stdpath4.dirname,
	isdirectory: true
})
		`
		await fs.writeFileAsync(Path.join(installpath, 'preload.js'), content)


		content= `
name: 'org.kodhe.tribot.d'
id: 'org.kodhe.tribot.d'
cluster: [
	{
		# address to listen
		"address": "127.0.0.1:49702"
		"purpose": "default"

		# all for use all CPU cores
		"count": 1
		"env":
			"CRON_ENABLED": 1
			"MEMSHARING": 1

	}
]

# folder for vhosts
include: [
	"./*/app.config.*"
	"./*.kwa"
]
		`
		await fs.writeFileAsync(Path.join(installpath, 'main.config.cson'), content)

		// create shorcut
		content= `AAABAAUAEBAAAAEAIABoBAAAVgAAABgYAAABACAAiAkAAL4EAAAgIAAAAQAgAKgQAABGDgAAMDAAAAEAIACoJQAA7h4AAAAAAAABACAATCAAAJZEAAAoAAAAEAAAACAAAAABACAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAA///////////+/v///v7////////W1v//oKD//4mJ//+Jif//oKD//9HR///+/v///v7///7+///////////////////+/v////////T0//+Rkf//X1///15e//9fX///XFz//1dX//9mZv//j4///+/v/////////v7////////+/v////////j4//+Fhf//hIT//4yM//+Jif//jo7//6Cg///Hx////////7u7//96ev//9fX////////+/v///f3///////+goP//oKD////////s7P//v7///6Wl//+hof//qKj//7W1///y8v//qqr//5eX/////////f3////////u7v//f3///+np//+env//b2///4CA//+bm///pqb//6Wl//99ff//gYH///z8//99ff//6Oj/////////////ycn//5qa///s7P//ZWX//93d/////////v7///39////////4OD//2Fh//+7u///o6P//8DA/////////////7m5//+srP//rKz//2Vl///n5///u7v//83N///Kyv//lZX//+Dg//9nZ///sLD//7Oz//+xsf/////////////Cwv//oqL//8bG//9jY///3t7//8nJ///e3v//+fn//+fn///4+P//cXH//+7u//+oqP//urr/////////////4+P//4CA////////fn7//6Gh///v7///6ur//93d///Fxf//hYX//25u///m5v//ior//9ra/////////v7///////+Kiv//wsL//87O//98fP//dXX//2Fh//9gYP//amr//7S0///8/P//x8f//4WF/////////v7///7+////////5eX//3Nz///c3P////////v7//+8vP//c3P//93d////////39///3Nz///f3/////////7+/////////f3////////Z2f//dXX//6io///39///+/v//4CA///b2///ubn//3Fx///S0v////////39///////////////////9/f////////Ly//+cnP//zc3//6en//9xcf//y8v//7y8///n5/////////39//////////////////////////////7+///+/v///v7////////R0f//ubn////////9/f////////7+/////////////////////////////////////////v7///39////////+/v//8fH/////////f3///7+/////////////////////////////////////////////////////////v7////////r6///+fn//////////////////////////////////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAAAGAAAADAAAAABACAAAAAAAAAJAAAAAAAAAAAAAAAAAAAAAAAA///////////////////////////+/v///v7////////z8///ycn//6en//+Wlv//lpb//6Wl///Gxv//8fH////////+/v///f3///////////////////////////////////////////////////7+////////9/f//7Ky//92dv//ZWX//2Nj//9kZP//ZWX//2Rk//9nZ///dHT//6qq///19f////////39/////////////////////////////////////////f3////////m5v//fX3//15e//9qav//b2///29v//9ubv//bGz//2ho//9hYf//Z2f//2Nj//9xcf//39/////////9/f/////////////////////////////+/v///////+bm//9tbf//aWn//25u//9hYf//X1///19f//9jY///amr//3x8//+hof//3d3//+/v//+EhP//Y2P//9/f/////////v7/////////////////////////////+/v//3t7//98fP//8PD//+Tk///V1f//0ND//8/P///U1P//4+P///j4/////////v7////////8/P//hob//3Fx///19f////////7+//////////////39////////tLT//2Fh///m5v/////////////s7P//xMT//6Oj//+MjP//fn7//3h4//97e///jo7//6mp///i4v//8vL//2Zm//+mpv////////39/////////v7////////6+v//b2///6Wl////////wsL//4KC//9bW///V1f//2dn//96ev//h4f//4mJ//+Cgv//cnL//1dX//+QkP///////7Cw//9nZ///8vL////////+/v///f3////////V1f//X1///+fn///g4P//Wlr//3Bw//+pqf//2Nj///Pz///+/v//////////////////+fn//3x8//99ff//4+P//+np//9jY///yMj////////9/f///Pz///////+zs///bm7////////n5///YWH//6+v/////////f3////////////////////////+/v///////4+P//9eXv//eHj///v7//96ev//paX////////8/P///f3///////+hof//gID///j4//+Ghv//YGD//6Cg////////5eX//97e///n5///39///7Cw//+cnP//8/P//6Gh//9fX///bm7///f3//+Njf//lJT////////9/f///f3///////+iov//f3////z8//9vb///XFz//5OT///9/f//g4P//2Ji///Q0P//8/P//319//+YmP///////6ys//9fX///xsb///////+Jif//lZX////////9/f///Pz///////+2tv//bm7///j4//+0tP//bm7//4CA////////7e3//9ra/////////v7////////9/f///////729//9dXf//39////////91df//p6f////////8/P///f3////////Y2P//YGD//9vb////////kpL//3Bw///09P////////7+/////////v7///X1///d3f//srL//3d3//9WVv//z8////Dw//9gYP//y8v////////9/f///v7////////8/P//cnL//52d////////nZ3//1VV//9zc///g4P//4+P//+Tk///hob//3h4//9jY///WVn//3x8//+4uP///////62t//9paf//9fX////////+/v////////39////////urr//11d///k5P//6Oj//6en//+Pj///fX3//2lp//9aWv//aGj//1xc//+Hh///4eH///n5////////6en//2Nj//+trf////////39/////////////////////////v7//4KC//9zc///8/P////////9/f///////9fX//+Njf//Zmb//5eX///o6P/////////////39///fHz//3h4///5+f////////7+///////////////////+/v///////+3t//9ycv//cXH//+Dg/////////f3////////6+v//cHD//6Oj/////////////+np//97e///amr//+bm/////////v7//////////////////////////////v7////////u7v//hIT//11d//+env//8/P///T0///09P//mJj//3x8////////ra3//15e//97e///5+f////////9/f////////////////////////////////////////7+/////////Pz//7+///9oaP//o6P//+zs//9vb///bW3//2dn///t7f//lJT//62t///7+/////////7+///////////////////////////////////////////////////+/v///v7////////6+v//29v///////+UlP//l5f//9zc///x8f/////////////+/v///v7///////////////////////////////////////////////////////////////////39/////////v7////////W1v//lpb////////+/v////////39///+/v/////////////////////////////////////////////////////////////////////////////+/v///f3///7+////////paX//+7u/////////v7///////////////////////////////////////////////////////////////////////////////////////////////////7+////////2dn//9/f/////////v7/////////////////////////////////////////////////////////////////////////////////////////////////////////////+Pj//+vr/////////v7/////////////////////////////////////////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKAAAACAAAABAAAAAAQAgAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAP///////////////////////////////////////////v7///7+/////////////+3t///MzP//s7P//6en//+mpv//sbH//8nJ///q6v/////////////+/v///f3///////////////////////////////////////////////////////////////////////////////////39/////////v7//9LS//+UlP//cnL//2Zm//9jY///Y2P//2Nj//9jY///ZWX//3Bw//+QkP//zMz///z8/////////f3////////////////////////////////////////////////////////////////////////9/f///////+fn//+Pj///YmL//2Ji//9paf//bGz//21t//9tbf//bW3//21t//9tbf//a2v//2Vl//9eXv//iIj//+Dg/////////f3//////////////////////////////////////////////////////////////f3////////Q0P//b2///2Vl//9vb///b2///21t//9sbP//bGz//21t//9tbf//bW3//2pq//9kZP//ZGT//3l5//9fX///Zmb//8XF/////////f3///////////////////////////////////////////////////39////////zc3//2Rk//9hYf//Y2P//2Fh//9kZP//ZWX//2Vl//9kZP//YmL//19f//9gYP//a2v//4yM///Fxf//+fn//8TE//9oaP//X1///8DA/////////f3////////////////////////////////////////+/v///////+Dg//9qav//Z2f//76+//+/v///nZ3//4yM//+EhP//hIT//4uL//+Zmf//sLD//8/P///x8f/////////////+/v///////9XV//9ra///Y2P//9PT/////////f3////////////////////////////////////////8/P//h4f//1tb//+9vf////////39////////////////////////+Pj///Dw///r6///5ub//+Tk///m5v//8vL///7+///+/v///////8vL//9gYP//enr///T0/////////v7////////////////////////9/f///////8LC//9YWP//lZX////////+/v////////X1///Q0P//qqr//4yM//93d///a2v//2Rk//9iYv//ZGT//2tr//92dv//iIj//6Cg///d3f///////6Oj//9XV///srL////////9/f/////////////////////////////+/v//goL//2Nj///e3v///////+fn//+qqv//enr//2Fh//9YWP//Wlr//2Fh//9qav//cXH//3Nz//9ycv//bGz//2Ji//9jY///V1f//6Ki////////6en//21t//91df//9fX////////+/v/////////////9/f///////93d//9fX///j4/////////U1P//aGj//2Fh//9fX///cnL//5WV//+6uv//1dX//+fn///w8P//8vL///Hx///n5///3t7//5eX//9eXv//nJz/////////////oKD//1lZ///Ozv////////39//////////////39////////uLj//1ZW//+8vP///////8/P//9iYv//cXH//7m5///x8f////////////////////////////////////////39////////vLz//15e//97e///lZX///Hx///T0///WFj//6io/////////f3//////////////f3///////+env//XV3//9vb////////4OD//2ho//9wcP//7+/////////+/v//+/v////////+/v///v7//////////////f3////////Kyv//Y2P//2xs//9cXP//29v///Hx//9jY///jo7////////+/v/////////////+/v///////4+P//9jY///8/P//9PT//91df//bW3//2ho///f3/////////v7////////6ur///z8///z8///wMD//+Xl//+cnP//8vL//97e//9kZP//b2///1tb///Fxf///////25u//9/f/////////////////////////7+////////i4v//2Zm///4+P//0ND//19f//9vb///Y2P//9bW///7+///e3v//6Cg//9mZv//2Nj///T0//9paf//W1v//3Fx///39///6ur//2pq//9ra///iYn//9jY////////cnL//3x8///9/f///////////////////v7///////+UlP//YGD//+3t///i4v//XFz//2tr//9iYv//w8P///////+urv//YWH//56e///+/v///////+np//+urv//5ub////////w8P//dHT//2Rk///c3P////////Dw//9sbP//hIT////////////////////////9/f///////6io//9YWP//1NT///j4//+ysv//hIT//1xc//+0tP////////39///z8////Pz///7+///8/P///v7///////////////////v7//9/f///YGD//8zM////////3t7//19f//+Xl/////////39//////////////39////////yMj//1dX//+srP////////////+jo///WFj//6am/////////f3///////////////////////////////////T0///R0f//mpr//3Fx//9aWv//tbX///////+6uv//Vlb//7e3/////////f3//////////////v7////////t7f//amr//3t7///19f///////6+v//9fX///fX3//6ys//+/v///y8v//87O///Ly///wMD//6ys//+Rkf//dnb//2Fh//9aWv//YmL//39////Z2f///////4eH//9hYf//4OD////////+/v///////////////////v7///////+bm///WVn//8DA////////vr7//1tb//9gYP//WFj//1pa//9dXf//Y2P//2Nj//9hYf//YWH//2Zm//9mZv//cnL//5iY///Pz///+fn////////Q0P//XV3//4yM///////////////////////////////////+/v///////9/f//9lZf//dXX//+/v///7+///0dH//7S0//+cnP//jIz//4KC//9ra///aWn//25u//9ubv//Wlr//6Ki///4+P///v7///7+////////9vb//4GB//9eXv//0tL////////9/f/////////////////////////////9/f///////6ys//9XV///kJD///v7/////////v7//////////////Pz//5OT//91df//aWn//3Nz//+qqv//5eX////////7+////f3///////+dnf//V1f//56e/////////v7/////////////////////////////////////////////+/v//46O//9XV///k5P///X1/////////Pz///39///+/v///////+Xl//9qav//c3P///Ly/////////Pz////////7+///oKD//1lZ//+Cgv//9fX////////+/v////////////////////////////////////////7+////////9PT//4uL//9XV///f3///9jY/////////v7///7+///+/v///////5CQ//9cXP//1NT/////////////4OD//4iI//9XV///gID//+zs/////////v7///////////////////////////////////////////////////7+////////+Pj//6Gh//9dXf//YGD//5GR///m5v///////+Tk///19f//t7f//1lZ//+4uP///////6Gh//9hYf//Wlr//5aW///y8v////////7+//////////////////////////////////////////////////////////////7+///+/v///////9HR//+Ghv//U1P//4WF////////o6P//2Zm//9ycv//WFj//46O////////goL//3V1///Jyf///v7///7+///+/v////////////////////////////////////////////////////////////////////////7+///9/f////////z8///W1v//n5///+3t///r6///Zmb//39///+bm///np7///7+///o6P//9fX////////9/f///v7////////////////////////////////////////////////////////////////////////////////////////9/f///v7////////+/v///Pz///////+Xl///ior////////9/f///////////////////f3//////////////////////////////////////////////////////////////////////////////////////////////////////////////f3///39///+/v///////97e//90dP//9PT//////////////v7///7+///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+/v///////5WV///T0/////////39//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////7+////////0tL//7m5/////////f3////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////6+v//x8f//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////v7////////r6///+fn///////////////////////////////////////////////////////////////////////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACgAAAAwAAAAYAAAAAEAIAAAAAAAACQAAAAAAAAAAAAAAAAAAAAAAAD////////////////////////////////////////////////////////////////////////////////9/f///v7///////////////////Ly///e3v//z8///8nJ///Jyf//zc3//9zc///u7v///v7//////////////v7///39///+/v///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////f3///7+/////////v7//+Dg//+ysv//jY3//3Z2//9ra///Z2f//2Vl//9lZf//Zmb//2pq//90dP//iIj//6ur///Z2f///Pz////////+/v///f3////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////9/f////////39///MzP//ior//2dn//9gYP//ZGT//2ho//9ra///bGz//2xs//9sbP//bGz//2tr//9paf//ZWX//2Bg//9kZP//goL//8HB///5+f////////39///+/v///////////////////////////////////////////////////////////////////////////////////////////////////////////////////v7///39////////39///4uL//9iYv//ZGT//2xs//9tbf//bGz//2xs//9ra///a2v//2tr//9ra///a2v//2tr//9sbP//bGz//21t//9sbP//Zmb//2Ji//+AgP//1NT////////9/f///v7////////////////////////////////////////////////////////////////////////////////////////////////////////+/v///v7///////+5uf//aGj//2Rk//9tbf//bW3//2tr//9ra///a2v//2tr//9ra///a2v//2tr//9ra///a2v//2tr//9ra///a2v//2tr//9tbf//bW3//2lp//9nZ///ZGT//6io///7+/////////7+//////////////////////////////////////////////////////////////////////////////////////////////7+/////////Pz//5+f//9gYP//bGz//21t//9ra///a2v//2tr//9ra///a2v//2tr//9ra///a2v//2tr//9ra///a2v//2xs//9tbf//bW3//2pq//9hYf//aGj//35+//9mZv//a2v//2Fh//+Njf//9PT////////+/v/////////////////////////////////////////////////////////////////////////////////////////////9/f//l5f//2Bg//9tbf//aWn//2xs//9tbf//bW3//21t//9tbf//bW3//21t//9tbf//bW3//21t//9tbf//bGz//2ho//9jY///YWH//29v//+amv//2tr///////++vv//amr//2tr//9jY///hIT///T0/////////v7//////////////////////////////////////////////////////////////////////////////v7///////+iov//YGD//2xs//9sbP//dnb//2Vl//9hYf//YWH//2Ji//9jY///ZGT//2Rk//9jY///YmL//2Fh//9hYf//Zmb//3V1//+UlP//v7///+3t//////////////7+////////3Nz//3Nz//9qav//Y2P//42N///7+//////////////////////////////////////////////////////////////////////////////9/f///////729//9hYf//bW3//2lp///S0v//+Pj//9fX//+/v///qqr//5qa//+Rkf//jY3//4yM//+QkP//mpr//6ur///Bwf//29v///X1///////////////////7+///+/v///39///8/P///////+Pj//9zc///a2v//2Fh//+mpv////////39//////////////////////////////////////////////////////////////7+////////5eX//2xs//9sbP//ZGT//8bG/////////f3/////////////////////////////////////////////////////////////////////////////////////////////////////////////+/v////////b2///a2v//2xs//9kZP//0ND////////9/f////////////////////////////////////////////////////////7+////////lJT//2Vl//9kZP//paX////////9/f///f3///v7///9/f/////////////+/v//7u7//9XV//+8vP//pqb//5eX//+MjP//h4f//4aG//+Kiv//kJD//5yc//+trf//xMT//93d///29v////////z8////////vb3//2Nj//9oaP//f3////r6/////////////////////////////////////////////////////////f3////////X1///Zmb//2lp//96ev//9fX////////8/P/////////////8/P//3Nz//6+v//+Jif//cHD//2Vl//9iYv//YmL//2Rk//9mZv//Z2f//2dn//9nZ///Zmb//2Rk//9iYv//YmL//2dn//93d///kZH//+jo/////////////42N//9mZv//Y2P//8DA/////////f3//////////////////////////////////////////////v7///////+Xl///ZWX//2Rk///Bwf////////z8////////8fH//7q6//+Dg///Z2f//2Fh//9nZ///bGz//2xs//9qav//Z2f//2Rk//9jY///YmL//2Ji//9iYv//Y2P//2Vl//9nZ///a2v//2xs//9qav//Wlr//8jI/////////////9jY//9oaP//Z2f//4KC///9/f/////////////////////////////////////////////+/v///////+rq//9vb///Zmb//3x8///39/////////Dw//+trf//c3P//2Fh//9nZ///bm7//2tr//9jY///YmL//2pq//95ef//i4v//5ub//+np///rq7//66u//+trf//paX//5eX//+Ghv//c3P//2pq//9ubv//Y2P//7u7////////+vr///////+Pj///ZWX//2dn///W1v////////39///////////////////////////////////9/f///////8HB//9kZP//Y2P//62t/////////////6ys//9XV///a2v//25u//9lZf//YmL//3Z2//+bm///w8P//+Pj///4+P//////////////////////////////////////////////////9PT//4SE//9oaP//YmL//6ys////////+/v////////Fxf//ZGT//2Nj//+oqP////////39///////////////////////////////////9/f///////5ub//9jY///aGj//9nZ/////////////7u7//9jY///bm7//2tr//+Ojv//ysr///X1//////////////////////////////39///9/f///f3///39///9/f///f3///39///9/f///////5eX//9kZP//aGj//4iI//+urv//ubn////////s7P//cXH//2Rk//+Hh////////////////////////////////////////////////////f3//4KC//9jY///eHj///X1/////////////8vL//9jY///a2v//3Jy///w8P////////7+///9/f///f3///7+///+/v///////////////////v7///7+/////////v7///z8///8/P///////6am//9hYf//bm7//2lp//9ZWf//goL/////////////iYn//2Nj//9zc///8PD////////+/v////////////////////////7+////////8fH//3R0//9iYv//jIz////////9/f///////9nZ//9mZv//bGz//2tr///l5f////////39///9/f///f3////////+/v///v7////////////////////////9/f/////////////9/f///////7a2//9hYf//bW3//21t//9paf//fn7///j4////////oaH//2Ji//9qav//39/////////9/f////////////////////////7+////////5+f//25u//9iYv//mpr////////r6///kZH//4CA//9ra///bGz//2Vl///Y2P////////39//////////////7+////////////////////////8fH//+Hh////////2tr//6+v///09P///////8XF//9iYv//bW3//2xs//9ra///dnb//+/v////////sbH//2Ji//9mZv//0tL////////9/f////////////////////////7+////////4eH//2tr//9iYv//o6P////////q6v//aWn//2Vl//9sbP//bW3//2Ji///Kyv////////7+///Jyf//19f///////+goP//paX/////////////jIz//2Ji//+rq///e3v//1JS///Pz////////9LS//9kZP//bGz//2xs//9jY///YGD//+Hh////////urr//2Nj//9kZP//y8v////////9/f////////////////////////7+////////4uL//2tr//9iYv//oqL////////29v//fHz//2lp//9sbP//bW3//2Fh//+5uf///////+fn//9dXf//bGz//4+P//9dXf//cnL///j4////////trb//2Ji//9cXP//W1v//5SU///7+////////+Hh//9paf//bGz//2lp//+Zmf//uLj//+7u////////urr//2Nj//9lZf//y8v////////9/f////////////////////////7+////////6en//25u//9iYv//mJj////////+/v//h4f//2dn//9tbf//bW3//2Fh//+qqv////////39//+trf//Y2P//1pa//9oaP//1NT////////9/f///////9HR//+MjP//oKD///T0/////////////+7u//9wcP//a2v//2Rk///S0v////////v7////////sLD//2Ji//9mZv//09P////////9/f////////////////////////7+////////8/P//3Z2//9iYv//iIj/////////////jY3//1xc//9ra///bW3//2Ji//+bm/////////39////////0dH//6Wl///W1v////////7+/////////v7///////////////////7+///+/v////////b2//96ev//amr//2Ji//++vv////////r6////////np7//2Ji//9ra///4eH////////+/v///////////////////////////////////////4aG//9jY///dXX///Dw////////2Nj//9nZ//+cnP//ZWX//2Zm//+Njf////////7+///9/f///////////////////v7///////////////////39///9/f//+/v///z8//////////////////+Fhf//aGj//2Ji//+xsf////////39////////hob//2Nj//91df//8vL////////+/v/////////////////////////////9/f///////6Gh//9jY///Z2f//9PT////////+/v///////+3t///YmL//2lp//+AgP///f3////////9/f//+/v///r6///7+////f3///39///9/f///v7////////////////////////8/P//2tr//6Cg//9ubv//bW3//2Rk//+iov/////////////p6f//b2///2Rk//+Li//////////////////////////////////////////////9/f///////8jI//9kZP//Y2P//6Wl////////+fn////////Gxv//YmL//2tr//90dP//6ur////////+/v////////////////////////////////////////39///t7f//0dH//6qq//+Bgf//Zmb//2Ji//9sbP//bW3//1pa//+Ojv////////////+9vf//ZGT//2Nj//+vr/////////39///////////////////////////////////+/v////////Dw//9zc///Zmb//3d3///y8v/////////////W1v//Zmb//21t//9qav//dHT//4iI//+amv//qan//7Oz//+3t///trb//7Cw//+kpP//lJT//4KC//9wcP//Y2P//2Ji//9oaP//bm7//2pq//9hYf//aWn//5iY///h4f////////39//+Hh///Zmb//2lp///d3f////////39/////////////////////////////////////////f3///////+goP//ZGT//2Nj//+3t//////////////i4v//YmL//2ho//9sbP//a2v//2dn//9kZP//YmL//2Ji//9hYf//YWH//2Fh//9hYf//Y2P//2Zm//9qav//bW3//2lp//9jY///Y2P//3d3//+np///4+P////////9/f///////83N//9lZf//Zmb//4qK/////////////////////////////////////////////////////////v7////////g4P//aWn//2lp//9zc///7Oz////////09P//l5f//3V1//9nZ///YmL//2Ji//9kZP//Zmb//2ho//9tbf//bm7//21t//9tbf//bW3//2xs//9tbf//bW3//35+//+goP//zc3///b2//////////////39///+/v//+vr//4KC//9oaP//ZGT//8rK/////////f3///////////////////////////////////////////////////39////////n5///2Nj//9lZf//l5f////////9/f////////X1///c3P//wsL//6qq//+Zmf//jY3//4WF//9wcP//bGz//2xs//9ra///a2v//2pq//9mZv//YGD//97e/////////f3////////9/f///f3///z8////////rKz//2Nj//9mZv//ior///////////////////////////////////////////////////////////////////7+////////7u7//3R0//9qav//Y2P//7W1////////+/v///////////////////////////////////////+Bgf//W1v//2dn//9sbP//amr//25u//+EhP//nJz//+zs/////////Pz///7+/////////Pz////////Kyv//ZWX//2xs//9paf//3t7////////+/v/////////////////////////////////////////////////////////////9/f///////8zM//9jY///bW3//2Rk//+/v/////////z8///8/P///f3///39///9/f///v7////////V1f//zc3//6mp//9mZv//aGj//319///5+f////////7+//////////////7+///8/P///////9PT//9qav//bW3//2Fh//+3t/////////39/////////////////////////////////////////////////////////////////////////f3///////+zs///YGD//25u//9kZP//tbX//////////////f3///7+///////////////////+/v///////+rq//9vb///amr//2xs///m5v////////39/////////f3///7+////////ycn//2lp//9sbP//YWH//56e/////////v7///////////////////////////////////////////////////////////////////////////////////7+////////qqr//2Bg//9tbf//Y2P//5aW///u7v////////7+///+/v/////////////8/P//+vr///////+QkP//ZWX//2Rk///Jyf////////39///+/v////////f3//+np///ZGT//21t//9gYP//lpb///z8/////////v7////////////////////////////////////////////////////////////////////////////////////////9/f///////7W1//9jY///amr//2Vl//9ycv//t7f///T0/////////v7//////////////f3////////Bwf//ZGT//2Nj//+qqv////////39///5+f//xMT//3t7//9jY///bGz//2Bg//+hof///Pz////////+/v///////////////////////////////////////////////////////////////////////////////////////////////////f3////////Q0P//dHT//2Nj//9paf//ZGT//3Fx///Dw/////////7+///g4P//4OD//+7u///c3P//cHD//2Nj//+Li/////////////+Ojv//X1///2lp//9lZf//a2v//76+/////////v7///7+//////////////////////////////////////////////////////////////////////////////////////////////////////////////39////////8PD//6Ki//9qav//ZWX//2Nj//91df//8vL///////+rq///X1///3Bw//9xcf//cHD//2tr//92dv//8fH///////+Tk///XFz//2ho//+UlP//5eX////////9/f///v7////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////9/f///v7////////j4///oaH//3Z2//9YWP//sLD////////s7P//cnL//2lp//9oaP//YGD//2Ji//9bW///0tL///////+4uP//jY3//9vb//////////////39/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////v7///39//////////////Ly///Fxf//sbH///v7////////q6v//19f//95ef//tLT//7Gx//+dnf//1NT////////6+v///v7////////+/v///v7////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+/v///f3///////////////////7+////////6ur//21t//9xcf//8PD////////+/v///////////////////v7///39//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////7+///9/f///v7////////9/f///////6en//9ZWf//0ND////////7+////v7////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+/v///////+jo//9iYv//r6/////////9/f///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////f3///////+YmP//h4f////////+/v///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////v7////////e3v//dnb///X1/////////v7///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////7+////////lpb//9PT/////////f3///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////7+////////0tL//7i4/////////f3/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+/v//8fH///+/v/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+/v///////+vr///4+P//////////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`
		await fs.writeFileAsync(Path.join(installpath, 'app.ico'), Buffer.from(content,'base64'))

		content= 'FOR /F "usebackq tokens=3 " %%i in (`REG QUERY "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\User Shell Folders" /v Desktop`) DO SET DESKTOPDIR=%%i' + "\r\n" + 
		'FOR /F "usebackq delims=" %%i in (`ECHO %DESKTOPDIR%`) DO SET DESKTOPDIR=%%i \r\n' + 
		'ECHO DESKTOP=%DESKTOPDIR%'

		await fs.writeFileAsync(Path.join(installpath, 'find-desktop.bat'), content)

		var desktop
		var p= Child.spawn(Path.join(installpath, 'find-desktop.bat'))
		p.stdout.on("data", function(d){
			d= d.toString()
			
			if(d.indexOf("DESKTOP=")>=0){

				desktop= d.split("=").slice(1).join("=").trim()
				if(desktop.startsWith("ECHO")){
					desktop = Path.join(Os.homedir(), "Desktop")
				}
			}
		})
		await (new Promise(function(a,b){
			p.on("error", b)
			p.on("exit", a)
		}))

		var promise= new Promise(function(a,b){
			
			ws.create(Path.join(desktop, "Tribot.lnk"), {
			    target : Path.join(Path.dirname(process.execPath),"kwcorew"),
			    args : JSON.stringify(Path.join(installpath, 'App.kwe')),
			    runStyle : ws.NORMAL,
				icon: Path.join(installpath, 'app.ico'),
			    desc : "Tribot, asistente contable"
			}, function(err) {
			    if (err){
					b(err)
				}
			    else{
					a()
				}
			})
		})
		await promise

		promise= new Promise(function(a,b){
			var path1= Path.join(process.env.APPDATA, "microsoft", "windows", "start menu", "programs", "Tribot.lnk")

			ws.create(path1, {
			    target :Path.join(Path.dirname(process.execPath),"kwcorew"),
			    args : JSON.stringify(Path.join(installpath, 'App.kwe')),
			    runStyle : ws.NORMAL,
				icon: Path.join(installpath, 'app.ico'),
			    desc : "Tribot, asistente contable"
			}, function(err) {
			    if (err)
			        b(err)
			    else
			        a()
			})
		})



		if(write.kwo){
			clearTimeout(progress.timer)
			progress.set(100)
			await sleep(2000)
		}else{
			console.info(" Presione ENTER para finalizar")
		}
	}catch(e){
		console.error("[ERROR] Failed installing: ", e)
		
	}
	
	await readLineAsync()
	process.exit()
}
